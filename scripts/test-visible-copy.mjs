import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeVisibleCopy,bindContent,normalizeText} from '../src/lib/content-bindings.mjs';
test('normalizes user copy while preserving code, URLs and attributes',()=>{
 const input='<p data-id="ёлка">Ёлка и ещё</p><script>const s="ёлка";</script><style>.ёлка{}</style><!-- ё -->';
 assert.equal(normalizeVisibleCopy(input),'<p data-id="ёлка">Елка и еще</p><script>const s="ёлка";</script><style>.ёлка{}</style><!-- ё -->');
});
test('old yo spelling still binds to stable editable IDs',()=>{
 assert.equal(normalizeText('Ещё'),'Еще');
 const html=bindContent('<span>И\u00a0ещё\u00a043+\u00a0параметра</span>');
 assert.match(html,/data-content-id=/);assert.ok(!normalizeVisibleCopy(html).includes('ё'));
});
