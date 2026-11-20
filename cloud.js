(()=>{'use strict';
let client,user,version=0,last='',pending=null,busy=false,timer,api,blocked=false;
const gate=document.getElementById('auth-gate'),form=document.getElementById('auth-form');
const msg=t=>document.getElementById('auth-message').textContent=t;
function status(t){api?.notice?.(t)}
function emergency(d){try{localStorage.setItem('verde_unsynced_backup',JSON.stringify({savedAt:new Date().toISOString(),payload:d}))}catch(e){status('Falha no backup local: exporte backup JSON agora.')}}
async function push(d){const json=JSON.stringify(d);if(json===last)return;
const q=version?client.from('finance_data').update({payload:d,version:version+1,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('version',version):client.from('finance_data').insert({user_id:user.id,payload:d,version:1});
const {data,error}=await q.select('version').maybeSingle();if(error)throw error;
if(!data)throw Error('Conflito: outro dispositivo modificou os dados. Faça backup JSON antes de recarregar.');
version=data.version;last=json;localStorage.removeItem('verde_unsynced_backup');}
async function flush(){if(busy||!pending||!user||blocked)return;busy=true;const d=pending;pending=null;
try{await push(d);status('Sincronizado na nuvem');if(pending)setTimeout(flush,100)}
catch(e){pending=d;blocked=true;emergency(d);status('SINCRONIZAÇÃO BLOQUEADA: '+e.message+' Exporte backup JSON.');alert('Não foi possível sincronizar. '+e.message+'\nExporte um backup JSON agora; não feche a página.');}
finally{busy=false}}
async function enter(session){user=session.user;msg('Carregando dados...');try{
const {data,error}=await client.from('finance_data').select('payload,version').eq('user_id',user.id).maybeSingle();if(error)throw error;
if(data){version=data.version;last=JSON.stringify(data.payload);api.load(data.payload)}else{version=0;const initial=api.initial();await push(initial)}
if(localStorage.getItem('verde_unsynced_backup')){status('Existe backup local de alterações não sincronizadas.');alert('Há alterações não sincronizadas neste navegador. Confira o backup local.');}
gate.style.display='none';}catch(e){user=null;msg('Erro ao carregar: '+e.message)}}
window.VerdeCloud={
save(d){if(!user||blocked){emergency(d);status('Dados não sincronizados — exporte backup JSON');return}pending=JSON.parse(JSON.stringify(d));emergency(pending);clearTimeout(timer);timer=setTimeout(flush,450)},
async signOut(){if(pending){await flush();if(pending||blocked){alert('Há dados não sincronizados. Exporte backup antes de sair.');return}}await client.auth.signOut();location.reload()},
async start(callbacks){api=callbacks;const cfg=window.VERDE_CONFIG;
if(!cfg?.url?.startsWith('https://')||!cfg?.anonKey||!window.supabase){msg('Erro de configuração Supabase.');form.style.display='none';return}
client=window.supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
const {data:{session},error}=await client.auth.getSession();if(error)msg(error.message);if(session)await enter(session);
form.onsubmit=async e=>{e.preventDefault();msg('Entrando...');const {data,error}=await client.auth.signInWithPassword({email:document.getElementById('auth-email').value,password:document.getElementById('auth-password').value});if(error)msg(error.message);else await enter(data.session)};
document.getElementById('auth-signup').onclick=async()=>{const email=document.getElementById('auth-email').value,password=document.getElementById('auth-password').value;if(!email||password.length<6){msg('Informe e-mail e senha de pelo menos 6 caracteres.');return}msg('Criando conta...');const {data,error}=await client.auth.signUp({email,password});if(error)msg(error.message);else if(data.session)await enter(data.session);else msg('Confirme seu e-mail e depois entre.')};
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState!=='visible'||!user||pending||busy||blocked)return;const {data,error}=await client.from('finance_data').select('payload,version').eq('user_id',user.id).maybeSingle();if(!error&&data&&data.version!==version){version=data.version;last=JSON.stringify(data.payload);api.load(data.payload);status('Atualizado com alterações de outro dispositivo')}});
window.addEventListener('beforeunload',e=>{if(pending||busy||blocked){e.preventDefault();e.returnValue=''}});
}};
})();