type WhatsAppMessageProps = {

  customerName: string;

  orderId: string;

  total: number;

  status: string;

  courier?: string | null;

  tracking?: string | null;

};



export function generateOrderWhatsAppMessage({

  customerName,

  orderId,

  total,

  status,

  courier,

  tracking,

}: WhatsAppMessageProps) {



  let statusMessage = "";



  switch(status){


    case "confirmed":

      statusMessage =
`உங்கள் ஆர்டர் உறுதி செய்யப்பட்டுள்ளது.
விரைவில் அனுப்பப்படும்.`;

      break;



    case "shipped":

      statusMessage =
`உங்கள் புத்தகங்கள் அனுப்பப்பட்டுவிட்டன.`;

      break;



    case "delivered":

      statusMessage =
`உங்கள் ஆர்டர் வெற்றிகரமாக வழங்கப்பட்டுள்ளது.
நன்றி.`;

      break;



    case "cancelled":

      statusMessage =
`உங்கள் ஆர்டர் ரத்து செய்யப்பட்டுள்ளது.`;

      break;



    default:

      statusMessage =
`உங்கள் ஆர்டர் பெறப்பட்டுள்ளது.`;

  }




  const trackingLink =
`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://karisalbooks.in"}/track-order?id=${orderId}`;





  const message =

`வணக்கம் ${customerName},


கரிசல் புத்தக மையம் 📚


Order ID:
${orderId}


Amount:
₹${total}


Status:
${status}



${statusMessage}



${
courier
?
`Courier:
${courier}`
:
""
}



${
tracking
?
`Tracking Number:
${tracking}`
:
""
}



Order Status பார்க்க:

${trackingLink}



நன்றி.

கரிசல் புத்தக மையம்`;



return message;


}