import {isCloudConfigured,signIn,signUp,sendRecovery,completeRecovery,useAuthRedirect,hasSession,apiRequest,signOut,clearSession} from "/assets/saas-client.mjs";
const $ = id => document.getElementById(id);
const modes = ["login","signup","recovery","update","signed-in"];
let mode = "login",busy = false;
function message(text,kind=""){const box=$("message");box.hidden=!text;box.textContent=text;box.className="message "+kind}
function choose(next) {
  if(!modes.includes(next))return;
  mode=next;
  const map={login:["Sign in","Use your email and password to access cloud projects.","Sign in"],
    signup:["Create account","We'll send a verification email if confirmation is required.","Create account"],
    recovery:["Reset your password","Enter your email to request a password reset link.","Send reset link"],
    update:["Choose a new password","Enter a new password after opening your recovery link.","Update password"],
    "signed-in":["Account connected","Your account can access permitted cloud projects.","Continue to Studio"]};
  const labels=map[next];
  $("heading").textContent=labels[0];$("description").textContent=labels[1];
  $("submit").textContent=labels[2];
  $("email-row").hidden=next==="update"||next==="signed-in";
  $("password-row").hidden=next==="recovery"||next==="signed-in";
  $("password").autocomplete=next==="login"?"current-password":"new-password";
  $("email").required=!$("email-row").hidden;$("password").required=!$("password-row").hidden;
  $("modes").hidden=next==="recovery"||next==="update"||next==="signed-in";
  $("secondary").textContent=next==="signed-in"?"Sign out":next==="recovery"?"Back to sign in":next==="signup"?"Already have an account? Sign in":"Forgot your password?";
  document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.mode===next)));
}
document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{message("");choose(btn.dataset.mode)}));
$("secondary").addEventListener("click",async()=>{
  if(mode==="signed-in"){await signOut();choose("login");message("Signed out.","success");return}
  choose(mode==="login"?"recovery":"login");message("")
});
$("account-form").addEventListener("submit",async event=>{
  event.preventDefault();if(busy)return;
  if(!isCloudConfigured()){message("Cloud accounts are not configured on this build.","error");return}
  busy=true;$("submit").disabled=true;message("");
  const email=$("email").value.trim().toLowerCase(),password=$("password").value;
  try{
    if(mode==="login"){await signIn(email,password);await apiRequest("GET","/api/me");choose("signed-in");message("Signed in successfully.","success")}
    else if(mode==="signup"){await signUp(email,password);message("If this address can be registered, follow the confirmation instructions sent by email. Then sign in.","success")}
    else if(mode==="recovery"){await sendRecovery(email);message("If the account exists, a recovery email has been sent.","success")}
    else if(mode==="update"){await completeRecovery(password);choose("signed-in");message("Password updated.","success")}
    else if(mode==="signed-in")location.assign("/studio/");
  }catch(e){if(mode==="login")clearSession();message(e.message||"Account request failed.","error")}
  finally{busy=false;$("submit").disabled=false;$("password").value=""}
});
(async()=>{
  choose("login");
  if(!isCloudConfigured()){
    $("submit").disabled=true;$("secondary").disabled=true;
    message("Cloud accounts are disabled until backend and email verification are configured and tested. All free calculators still work.","error");
    return;
  }
  try{
    const type=await useAuthRedirect();
    if(type==="recovery"){choose("update");message("Recovery link accepted. Set a new password.","success");return}
    if(hasSession()){await apiRequest("GET","/api/me");choose("signed-in");message("Your cloud session is active.","success")}
    else if(type){message("Email verified. Sign in to continue.","success")}
  }catch(e){message(e.message||"Unable to restore account session.","error");clearSession()}
})();
