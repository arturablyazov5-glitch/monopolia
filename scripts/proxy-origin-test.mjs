// TASK-072: sandbox only; never load .env or real credentials.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {mkdtemp,rm} from 'node:fs/promises';
import {createAdminAPI} from '../server/admin-api.mjs';
import {passwordHash} from '../server/admin-auth.mjs';
import {handleLead} from '../server/lead-core.mjs';
const origin='https://fixture.lhr.life';
const credentials={username:'fixture-editor',password:'fixture-only-passphrase'};
const lead={form:'modal',source:'ТЕСТ TASK-072',phone:'+79991234567',consent:true,honeypot:'',page:origin+'/buy/'};
const cases=[
  ...['127.0.0.1','::1','::ffff:127.0.0.1'].map(peer=>({name:'trusted '+peer,peer,trust:'1',status:200})),
  {name:'disabled',peer:'127.0.0.1',trust:'0',status:403},
  {name:'external peer',peer:'203.0.113.10',trust:'1',status:403},
  {name:'default trust disabled',peer:'127.0.0.1',status:403},
  {name:'exact origin required',peer:'127.0.0.1',trust:'1',origin:origin+'.evil.example',status:403},
  {name:'missing host',peer:'127.0.0.1',trust:'1',host:'',status:403},
  {name:'missing proto',peer:'127.0.0.1',trust:'1',proto:'',status:403},
  {name:'foreign origin',peer:'127.0.0.1',trust:'1',origin:'https://evil.example',status:403},
  ...['fixture.lhr.life@evil.example','fixture.lhr.life/path','fixture.lhr.life,evil.example','fixture.lhr.life:443/path','FIXTURE.lhr.life','fixture .lhr.life'].map(host=>({name:'invalid host '+host,peer:'127.0.0.1',trust:'1',host,status:403})),
  {name:'invalid proto',peer:'127.0.0.1',trust:'1',proto:'https,http',status:403},
];
function invoke(api,{method='POST',path='/api/admin/session',headers,peer,body=credentials}) {
  const req=Readable.from(body===undefined?[]:[Buffer.from(JSON.stringify(body))]);
  Object.assign(req,{method,url:path,headers,socket:{remoteAddress:peer}});
  return new Promise((resolve,reject)=>{
    const result={headers:{}};
    const res={setHeader(k,v){result.headers[k.toLowerCase()]=v;},writeHead(status,headers){result.status=status;Object.assign(result.headers,headers);},end(data){result.body=data;resolve(result);}};
    api.handler(req,res).catch(reject);
  });
}
test('loopback proxy Origin: actual admin login and /lead',async t=>{
  const root=await mkdtemp('/private/tmp/task-072-origin-');
  const env={DATA_DIR:root,ADMIN_USER:credentials.username,ADMIN_PASSWORD_HASH:await passwordHash(credentials.password),LEAD_DRY_RUN:'1'};
  try {
    for(const c of cases)await t.test(c.name,async()=>{
      const config={...env,TRUST_PROXY:c.trust};
      const headers={host:'127.0.0.1:8787',origin:c.origin||origin,'content-type':'application/json','x-forwarded-host':c.host??'fixture.lhr.life','x-forwarded-proto':c.proto??'https'};
      const api=await createAdminAPI({env:config});
      try {
        const login=await invoke(api,{headers,peer:c.peer});assert.equal(login.status,c.status);
        if(c.status===200){assert.match(login.headers['set-cookie'],/; Secure/);assert.match(login.headers['set-cookie'],/SameSite=Strict/);}
        const response=await handleLead(new Request('http://localhost/lead',{method:'POST',headers,body:JSON.stringify(lead)}),config,{ip:c.name,remoteAddress:c.peer});
        assert.equal(response.status,c.status);
      }finally{await api.close();}
    });
    await t.test('allowlist and GET without Origin remain usable',async()=>{
      const api=await createAdminAPI({env:{...env,TRUST_PROXY:'0'}});
      try {
        assert.equal((await invoke(api,{headers:{host:'127.0.0.1:8787',origin:'http://127.0.0.1:4321','content-type':'application/json'},peer:'203.0.113.1'})).status,200);
        assert.equal((await invoke(api,{method:'GET',path:'/api/catalog',headers:{host:'127.0.0.1:8787'},peer:'127.0.0.1',body:undefined})).status,200);
      }finally{await api.close();}
    });
  }finally{await rm(root,{recursive:true,force:true});}
});

test('local dev accepts changing ports, while production and foreign origins stay restricted', async t => {
  const root = await mkdtemp('/private/tmp/admin-dev-port-');
  const base = { DATA_DIR: root, ADMIN_USER: credentials.username,
    ADMIN_PASSWORD_HASH: await passwordHash(credentials.password) };
  try {
    for (const enabled of [false, true]) {
      const api = await createAdminAPI({ env: { ...base, ...(enabled ? { MONOPOLY_LOCAL_DEV: '1' } : {}) } });
      try {
        for (const port of [4325, 4337, 51347]) await t.test(`${enabled ? 'dev' : 'production'} port ${port}`, async () => {
          const host = `127.0.0.1:${port}`;
          const result = await invoke(api, { headers: { host, origin: `http://${host}`, 'content-type': 'application/json' }, peer: '127.0.0.1' });
          assert.equal(result.status, enabled ? 200 : 403);
          if (enabled) assert.doesNotMatch(result.headers['set-cookie'], /; Secure/);
        });
        if (enabled) {
          for (const c of [
            { host: '127.0.0.1:4337', origin: 'https://evil.example', peer: '127.0.0.1' },
            { host: '127.0.0.1:4337', origin: 'http://127.0.0.1:4338', peer: '127.0.0.1' },
            { host: 'evil.example:4337', origin: 'http://evil.example:4337', peer: '127.0.0.1' },
            { host: '127.0.0.1:4337', origin: 'http://127.0.0.1:4337', peer: '203.0.113.1' },
            { host: '127.0.0.1:99999', origin: 'http://127.0.0.1:99999', peer: '127.0.0.1' },
          ]) {
            const result = await invoke(api, { headers: { host: c.host, origin: c.origin, 'content-type': 'application/json' }, peer: c.peer });
            assert.equal(result.status, 403, JSON.stringify(c));
          }
          const catalog = await invoke(api, { method: 'GET', path: '/api/catalog', headers: { host: '127.0.0.1:51347' }, peer: '127.0.0.1', body: undefined });
          assert.equal(catalog.status, 200);
        }
      } finally { await api.close(); }
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});
