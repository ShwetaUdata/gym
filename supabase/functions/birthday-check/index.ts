import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMAIL_USER = Deno.env.get("EMAIL_USER") || "";
const EMAIL_PASSWORD = Deno.env.get("EMAIL_PASSWORD") || "";

interface BirthdayCheckRequest {
  clients: Array<{
    clientId: string;
    name: string;
    email: string;
    dob: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Birthday check function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clients }: BirthdayCheckRequest = await req.json();

    if (!clients || !Array.isArray(clients)) {
      return new Response(
        JSON.stringify({ error: "Invalid clients data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!EMAIL_USER || !EMAIL_PASSWORD) {
      console.error("Email credentials not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const today = new Date();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayString = `${todayMonth}-${todayDay}`;

    console.log(`Checking birthdays for today: ${todayString}`);

    const birthdayClients = clients.filter(client => {
      if (!client.dob) return false;
      const dob = new Date(client.dob);
      const dobMonth = String(dob.getMonth() + 1).padStart(2, '0');
      const dobDay = String(dob.getDate()).padStart(2, '0');
      return `${dobMonth}-${dobDay}` === todayString;
    });

    console.log(`Found ${birthdayClients.length} clients with birthdays today`);

    const results: Array<{ clientId: string; success: boolean; error?: string }> = [];

    for (const client of birthdayClients) {
      try {
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #f59e0b); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">🎂 Happy Birthday! 🎉</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #374151; margin-bottom: 20px;">Dear ${client.name},</h2>
              <p style="color: #374151; line-height: 1.6;">Happy Birthday! 🎉🎂</p>
              <p style="color: #374151; line-height: 1.6;">On this special day, the entire PowerFit Gym family wishes you health, happiness, and strength!</p>
              <p style="color: #374151; line-height: 1.6;">As a birthday treat, enjoy a special workout session on us. Visit the front desk to claim your birthday reward.</p>
              <p style="color: #374151; line-height: 1.6;">Keep crushing your goals!</p>
              <p style="color: #374151; line-height: 1.6; margin-top: 30px;">Warm wishes,<br/><strong>PowerFit Gym Team</strong></p>
            </div>
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>© ${new Date().getFullYear()} PowerFit Gym. All rights reserved.</p>
            </div>
          </div>
        `;

        const smtpClient = new SMTPClient({
          connection: {
            hostname: "smtp.gmail.com",
            port: 465,
            tls: true,
            auth: {
              username: EMAIL_USER,
              password: EMAIL_PASSWORD,
            },
          },
        });

        await smtpClient.send({
          from: EMAIL_USER,
          to: client.email,
          subject: `Happy Birthday ${client.name}! 🎂`,
          content: "auto",
          html: html,
        });

        await smtpClient.close();

        console.log(`Birthday email sent to ${client.name} (${client.email})`);
        results.push({ clientId: client.clientId, success: true });
      } catch (error: any) {
        console.error(`Failed to send birthday email to ${client.name}:`, error);
        results.push({ clientId: client.clientId, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        birthdayCount: birthdayClients.length,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in birthday check:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Birthday check failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
