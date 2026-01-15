
export const emailTemplates = {
    weeklyReport: (userName: string, balance: string, savings: string) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px; text-align: center;">
          <div style="width: 48px; height: 48px; background-color: #10b981; border-radius: 12px; margin: 0 auto 16px; line-height: 48px; color: white; font-size: 24px; font-weight: bold;">F</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Resumo Semanal</h1>
          <p style="color: #a1a1aa; margin: 8px 0 0; font-size: 14px;">FluxCash Intelligence</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 32px;">
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Olá, <strong>${userName}</strong>,</p>
          <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #52525b;">Aqui está a análise da sua performance financeira nos últimos 7 dias. Você manteve o controle!</p>

          <!-- Cards -->
          <div style="display: flex; gap: 16px; margin-bottom: 32px;">
            <div style="flex: 1; background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 12px; padding: 20px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #15803d; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Saldo Atual</p>
              <p style="margin: 0; font-size: 20px; font-weight: 800; color: #14532d;">R$ ${balance}</p>
            </div>
            <div style="flex: 1; background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #1d4ed8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Economia</p>
              <p style="margin: 0; font-size: 20px; font-weight: 800; color: #1e3a8a;">${savings}%</p>
            </div>
          </div>

          <!-- Insight -->
          <div style="background-color: #fafafa; border-radius: 12px; padding: 24px; border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 8px; font-size: 16px; color: #18181b;">💡 Insight da IA</h3>
            <p style="margin: 0; font-size: 14px; color: #52525b; line-height: 1.6;">Você gastou 15% menos em "Alimentação" essa semana comparado à anterior. Ótimo trabalho mantendo a disciplina!</p>
          </div>

          <div style="margin-top: 40px; text-align: center;">
            <a href="https://fluxcash.app" style="background-color: #18181b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 100px; font-weight: 600; font-size: 14px; display: inline-block;">Ver Relatório Completo</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
          <p style="margin: 0; font-size: 12px; color: #a1a1aa;">© 2026 FluxCash. Todos os direitos reservados.</p>
          <div style="margin-top: 12px;">
            <a href="#" style="color: #a1a1aa; text-decoration: none; font-size: 12px; margin: 0 8px;">Configurações</a>
            <a href="#" style="color: #a1a1aa; text-decoration: none; font-size: 12px; margin: 0 8px;">Ajuda</a>
          </div>
        </div>
      </div>
    </div>
  `,

    securityAlert: (userName: string, device: string, location: string) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 0; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border-top: 4px solid #f43f5e;">
        
        <!-- Body -->
        <div style="padding: 40px 32px;">
          <div style="width: 56px; height: 56px; background-color: #fff1f2; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
             <span style="font-size: 28px;">🛡️</span>
          </div>
          
          <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; text-align: center; color: #be123c;">Alerta de Segurança</h1>
          
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; text-align: center; color: #52525b;">Detectamos um novo login na sua conta FluxCash.</p>

          <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Dispositivo</td>
                <td style="padding: 8px 0; color: #18181b; font-weight: 600; text-align: right; font-size: 14px;">${device}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Localização</td>
                <td style="padding: 8px 0; color: #18181b; font-weight: 600; text-align: right; font-size: 14px;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #71717a; font-size: 14px;">Data</td>
                <td style="padding: 8px 0; color: #18181b; font-weight: 600; text-align: right; font-size: 14px;">Agora</td>
              </tr>
            </table>
          </div>

          <p style="margin: 0 0 24px; font-size: 14px; text-align: center; color: #52525b;">Se foi você, pode ignorar este email. Caso contrário, proteja sua conta imediatamente.</p>

          <div style="text-align: center;">
            <a href="#" style="background-color: #ffffff; color: #be123c; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid #e11d48;">Não fui eu</a>
          </div>
        </div>
      </div>
    </div>
  `
};
