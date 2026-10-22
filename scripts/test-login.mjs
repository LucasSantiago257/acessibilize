import assert from 'node:assert/strict';
const root=process.argv[2]||'http://127.0.0.1:5173';
if(!['127.0.0.1','localhost'].includes(new URL(root).hostname))throw Error('Execute os testes somente na prévia local.');
const accounts=JSON.parse(process.env.ACESSIBILIZE_TEST_ACCOUNTS||'[]');
assert.equal(accounts.length,3,'Informe as três contas em ACESSIBILIZE_TEST_ACCOUNTS.');
const headers={'Content-Type':'application/json',Origin:root};
const unauthenticated=await(await fetch(root+'/api/community')).json();
assert.equal(unauthenticated.signedIn,false);
assert.equal((await fetch(root+'/api/community',{method:'POST',headers,body:'{}'})).status,401);
assert.equal((await fetch(root+'/api/session',{method:'POST',headers,body:JSON.stringify({name:'Sem senha'})})).status,400);
assert.equal((await fetch(root+'/api/session',{method:'POST',headers,body:JSON.stringify({username:accounts[0].username,password:'incorreta'})})).status,401);
for(const account of accounts){
 const login=await fetch(root+'/api/session',{method:'POST',headers,body:JSON.stringify(account)});
 assert.equal(login.status,200,await login.clone().text());
 const session=(login.headers.getSetCookie()||[]).find(v=>v.startsWith('az_session='));
 assert(session?.includes('HttpOnly'));assert(session?.includes('SameSite=Lax'));
 const cookie=session.split(';')[0];
 const state=await(await fetch(root+'/api/community',{headers:{Cookie:cookie}})).json();
 assert.equal(state.signedIn,true);assert.equal(state.user.username,account.username);
 assert(!JSON.stringify(state.user).includes('password'));
 const denied=await fetch(root+'/api/session',{method:'DELETE',headers:{...headers,Cookie:cookie,Origin:'https://external.example'}});assert.equal(denied.status,403);
 const logout=await fetch(root+'/api/session',{method:'DELETE',headers:{...headers,Cookie:cookie}});assert.equal(logout.status,200);
 const revoked=await(await fetch(root+'/api/community',{headers:{Cookie:cookie}})).json();assert.equal(revoked.signedIn,false);
 const write=await fetch(root+'/api/community',{method:'POST',headers:{...headers,Cookie:cookie},body:'{}'});assert.equal(write.status,401);
}
console.log('Três contas validadas: senha obrigatória, erro de senha, sessão persistente, revogação no logout e publicação bloqueada sem sessão.');
