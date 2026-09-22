import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const WEB3FORMS_ACCESS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY || "7f0e27f4-7df7-4105-af7a-985d05cc02d1";
const TARGET_EMAIL = "info@weblix-jo.com";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session || session.role !== "super_admin") {
      return NextResponse.json(
        { error: "Unauthorized. Super Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      ticketId,
      category,
      urgency,
      subject,
      description,
      adminName,
      contactPhone,
      diagnostics,
    } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: "Ticket subject and detailed description are required." },
        { status: 400 }
      );
    }

    const officialTicketId = ticketId || `#TK-${Math.floor(100000 + Math.random() * 900000)}`;
    const formattedSubject = `[Ciao Support ${officialTicketId}] [${(urgency || "MEDIUM").toUpperCase()}] ${category || "General"}: ${subject}`;

    const formattedMessage = `
==================================================
CIAO LOYALTY - INCIDENT / SUPPORT TICKET
==================================================
Ticket ID: ${officialTicketId}
Category: ${category || "General Issue"}
Urgency Level: ${(urgency || "Medium").toUpperCase()}
Admin / Branch Name: ${adminName || session.name || "Administrator"}
Contact Phone / WhatsApp: ${contactPhone || "Not provided"}
Logged-In Account: ${session.email || session.userId}
Destination Email: ${TARGET_EMAIL}
Reported At: ${diagnostics?.localTime || new Date().toISOString()}

--------------------------------------------------
ISSUE SUBJECT:
--------------------------------------------------
${subject}

--------------------------------------------------
DETAILED DESCRIPTION:
--------------------------------------------------
${description}

==================================================
AUTOMATIC TECHNICAL DIAGNOSTICS
==================================================
Device Type: ${diagnostics?.deviceType || "Unknown"}
Operating System: ${diagnostics?.os || "Unknown"}
Browser: ${diagnostics?.browser || "Unknown"}
Viewport Dimensions: ${diagnostics?.viewport || "Unknown"}
Current URL: ${diagnostics?.currentUrl || "/admin"}
Raw User Agent: ${diagnostics?.userAgent || "Unknown"}
Jordan Local Time: ${diagnostics?.localTime || "Unknown"}
==================================================
`;

    // Forward to Web3Forms API
    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: formattedSubject,
        from_name: `Ciao System Support (${adminName || "Admin"})`,
        email: TARGET_EMAIL,
        replyto: TARGET_EMAIL,
        ticket_id: officialTicketId,
        category: category,
        urgency: urgency,
        admin_name: adminName || session.name,
        contact_phone: contactPhone,
        message: formattedMessage,
        device_type: diagnostics?.deviceType,
        browser: diagnostics?.browser,
        os: diagnostics?.os,
        viewport: diagnostics?.viewport,
      }),
    });

    const web3Data = await web3Response.json();

    if (!web3Response.ok || !web3Data.success) {
      console.warn("Web3Forms API Notice:", web3Data);
      return NextResponse.json(
        {
          success: false,
          error: web3Data.message || "Web3Forms submission failed",
          canFallbackClient: true,
          ticketId: officialTicketId,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      ticketId: officialTicketId,
      message: "Support ticket dispatched successfully to info@weblix-jo.com",
    });
  } catch (error: any) {
    console.error("Support ticket server error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        canFallbackClient: true,
      },
      { status: 500 }
    );
  }
}
