import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMAIL_USER = Deno.env.get("EMAIL_USER") || "";
const EMAIL_PASSWORD = Deno.env.get("EMAIL_PASSWORD") || "";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  clientName?: string;
  emailType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send email function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, clientName, emailType }: EmailRequest = await req.json();

    console.log(`Sending ${emailType || 'custom'} email to: ${to}`);
    console.log(`Subject: ${subject}`);

    if (!to || !subject || !html) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
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

    // Create SMTP client for Gmail
    const client = new SMTPClient({
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

    await client.send({
      from: EMAIL_USER,
      to: to,
      subject: subject,
      content: "auto",
      html: html,
    });

    await client.close();

    console.log("Email sent successfully to:", to);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent successfully to ${to}` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
