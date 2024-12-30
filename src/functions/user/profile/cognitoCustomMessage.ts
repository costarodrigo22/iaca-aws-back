import { CustomMessageTriggerEvent } from "aws-lambda";

export async function handler(event: CustomMessageTriggerEvent) {
  const name = event.request.userAttributes.given_name;
  const code = event.request.codeParameter;
  const email = event.request.userAttributes.email;

  if (event.triggerSource === "CustomMessage_SignUp") {
    event.response.emailSubject = `Bem-vindo(a) ${name}`;
    event.response.emailMessage = `<h1>Seja muito bem-vindo(a) ao IAÇA ${name}!</h1>
    <br/> <br/>
    Use este código para confirmar a sua conta <strong>${code}</strong> e acesse o link:
    <br />
    http://localhost:3000/confirm-account/?email=${encodeURIComponent(email)}`;
  }

  if (event.triggerSource === "CustomMessage_ForgotPassword") {
    event.response.emailSubject = "Recuperação de conta";
    event.response.emailMessage = `<h1>Olá ${name}</h1>
    Para recuper a sua conta use o código <strong>${code}</strong> e acesse o link:
    <br />
    http://localhost:3000/reset-password/?email=${encodeURIComponent(email)}`;
  }

  return event;
}
