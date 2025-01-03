export const getPurchaseApprovedEmailHtml = (
  userName: string,
  trackingUrl: string
) => `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Compra Aprovada</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #2B0036;
          margin: 0;
        }
        .content {
          text-align: left;
        }
        .content p {
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 0.9em;
          color: #777777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pedido recebido!</h1>
        </div>
        <div class="content">
          <p>Olá, ${userName},</p>
          <p>Seu pagamento foi recebido com sucesso e sua compra está confirmada!</p>
          <p>
            Agora, você pode:
            <ul>
              <li>Dirigir-se ao local de retirada para buscar o seu pedido.</li>
              <li>Ou, caso tenha solicitado entrega, aguardar que ela seja realizada.</li>
            </ul>
          </p>
          <span>Para acompanhar o pedido <a href="${trackingUrl}" style="color: #2B0036; text-decoration: none; font-weight: bold;">
            CLIQUE AQUI
          </a></span>
          <p>
            Estamos à disposição caso tenha dúvidas ou precise de mais informações.
          </p>
          <p>
            Agradecemos por escolher nossos produtos e esperamos que tenha uma excelente experiência!
          </p>
        </div>
        <div class="footer">
          <p>Atenciosamente,</p>
          <p><strong>Equipe Iacapuro</strong></p>
        </div>
      </div>
    </body>
  </html>
`;
