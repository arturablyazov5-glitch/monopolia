import { readFile, chmod, lstat } from 'node:fs/promises';
import { passwordHash } from './admin-auth.mjs';
import { resolve } from 'node:path';
import {parseEnv} from 'node:util';
import {atomic} from './admin-storage.mjs';
if (!process.stdin.isTTY || !process.stdout.isTTY) throw Error('Откройте интерактивный терминал');
function hidden(prompt) {
  return new Promise((done,reject) => {
    process.stdout.write(prompt);
    let value = '';
    process.stdin.setRawMode(true); process.stdin.resume();
    const finish = () => { process.stdin.off('data',listener); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); };
    const listener = (bytes) => {
      for (const char of bytes.toString('utf8')) {
        if (char === '\u0003') { finish(); reject(Error('Отменено')); return; }
        if (char === '\r' || char === '\n') { finish(); done(value); return; }
        if (char === '\u007f') value = value.slice(0,-1);
        else if (char >= ' ') value += char;
      }
    };
    process.stdin.on('data',listener);
  });
}
try {
  const first = await hidden('Новый пароль (не отображается): ');
  const second = await hidden('Повторите пароль: ');
  if (first.length < 12 || first.length > 256 || first !== second) throw Error('Нужно не менее 12 символов и одинаковый повтор');
  const path = resolve('.env');
  let contents = '';
  try { if ((await lstat(path)).isSymbolicLink()) throw Error('Символическая ссылка запрещена'); contents = await readFile(path,'utf8'); } catch(e) { if(e.code !== 'ENOENT') throw e; }
  const quote=["'", '"', '`'].find(q=>!first.includes(q));
  if(!quote)throw Error('Выберите пароль без одного из видов кавычек: одинарных, двойных или обратных');
  const encoded=quote+first+quote;
  if(parseEnv('VALUE='+encoded).VALUE!==first)throw Error('Этот пароль нельзя сохранить в env-файле; выберите другой');
  for (const [name,value] of [['ADMIN_PASSWORD_HASH',await passwordHash(first)],['ADMIN_PASSWORD',encoded]]) {
    const pattern=new RegExp('^'+name+'=.*$','gm');
    const line=name+'='+value;
    contents=pattern.test(contents)?contents.replace(pattern,()=>line):contents.replace(/\n?$/,'\n')+line+'\n';
  }
  await atomic(path,contents); await chmod(path,0o600);
  console.log('Обновлены ADMIN_PASSWORD_HASH и ADMIN_PASSWORD. Пароль хранится открыто в .env для бота; защитите файл правами 600. Перезапустите сервер.');
} catch(e) { console.error(e.message); process.exitCode = 1; }
