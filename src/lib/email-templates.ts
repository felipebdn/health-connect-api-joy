interface SendInvitationTemplateProps {
  provider_name: string
  institution_name: string
  to_accept: string
  platform_name: string
}

export function sendInvitationTemplate(data: SendInvitationTemplateProps) {
  return `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="UTF-8">
              <title>Solicitação de Vinculação</title>
              <style>
                body {
                  background-color: #f4f4f4;
                  font-family: Arial, sans-serif;
                  padding: 20px;
                }
                .container {
                  background-color: #ffffff;
                  padding: 30px;
                  border-radius: 10px;
                  max-width: 600px;
                  margin: auto;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                h2 {
                  color: #333333;
                }
                p {
                  color: #555555;
                  line-height: 1.5;
                }
                .cta-button {
                  display: inline-block;
                  padding: 12px 24px;
                  margin: 10px 5px 0 0;
                  font-size: 16px;
                  color: #ffffff;
                  background-color: #4CAF50;
                  text-decoration: none;
                  border-radius: 5px;
                }
                .cta-button.decline {
                  background-color: #f44336;
                }
                .footer {
                  margin-top: 30px;
                  font-size: 12px;
                  color: #999999;
                  text-align: center;
                }
              </style>
            </head>
            <body>

              <div class="container">
                <h2>Solicitação de Vinculação</h2>
                <p>Olá <strong>${data.provider_name}</strong>,</p>

                <p>A clínica <strong>${data.institution_name}</strong> gostaria de se vincular ao seu perfil profissional em nossa plataforma.</p>

                <p>Ao aceitar essa solicitação, você permitirá que a clínica tenha acesso às suas informações profissionais e possa agendar consultas em conjunto.</p>

                <a href="${data.to_accept}" class="cta-button">Aceitar Vinculação</a>

                <p>Se você não reconhece esta solicitação, pode simplesmente ignorar este e-mail.</p>

                <div class="footer">
                  <p>Este e-mail foi enviado automaticamente pela plataforma ${data.platform_name}.</p>
                </div>
              </div>

            </body>
            </html>
          `
}
