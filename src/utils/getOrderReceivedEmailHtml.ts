export const getOrderReceivedEmailHtml = (userName: string) => `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pedido Recebido</title>
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
          <h1>Pedido Recebido!</h1>
        </div>
        <div class="content">
          <p>Olá, ${userName},</p>
          <p>
            Recebemos o seu pedido e ele está em processamento.
            Em breve, você receberá um e-mail de confirmação com os detalhes do acompanhamento do pedido.
          </p>
          <p>
            Caso tenha dúvidas ou precise de ajuda, estamos à disposição para atendê-lo. Entre em contato pelo site.
          </p>
          <p>Obrigado por confiar em nossos serviços!</p>
        </div>
        <div class="footer">
          <p>Atenciosamente,</p>
          <p><strong>Equipe Iacapuro</strong></p>
        </div>
      </div>
    </body>
  </html>

`;
