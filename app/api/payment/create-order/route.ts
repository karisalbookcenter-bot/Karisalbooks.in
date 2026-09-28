import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";


export async function POST(
  request: Request
) {

  try {

    const body = await request.json();


    const {
      amount,
      orderId,
    } = body;



    if (!amount) {

      return NextResponse.json(
        {
          error: "Amount required",
        },
        {
          status: 400,
        }
      );

    }



    const razorpayOrder =
      await razorpay.orders.create({

        amount: Math.round(amount * 100),

        currency: "INR",

        receipt:
          orderId ??
          `order_${Date.now()}`,

      });



    return NextResponse.json({

      success: true,

      order: razorpayOrder,

    });



  } catch(error) {


    console.error(
      "RAZORPAY CREATE ORDER ERROR:",
      error
    );


    return NextResponse.json(
      {
        error:
          "Unable to create payment order",
      },
      {
        status:500,
      }
    );


  }

}