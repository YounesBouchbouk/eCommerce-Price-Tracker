import { NextResponse } from "next/server";
import { scrapeAndStoreProduct } from "../../../../lib/action";
import Product from "../../../../lib/models/product.model";
import { ConnectToDB } from "../../../../lib/mongoose";
import { generateEmailBody, sendEmail } from "../../../../lib/nodemailer";
import {
  getAveragePrice,
  getEmailNotifType,
  getHighestPrice,
  getLowestPrice,
} from "../../../../lib/utils";

export async function GET() {
  try {
    ConnectToDB();

    const product = await Product.find({});

    if (!product) throw new Error("No products to track");

    const updatedProducts = await Promise.all(
      product.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAndStoreProduct(currentProduct.url);

        if (!scrapedProduct) throw new Error("no product has found");

        const updatedPriceHistory: any = [
          ...currentProduct.priceHistory,
          { price: Number(scrapedProduct.currentPrice) },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          averagePrice: getAveragePrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          lowestPrice: getLowestPrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: scrapedProduct.url },
          product
        );

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY

        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          // Construct emailContent
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          // Get array of user emails
          const userEmails = updatedProduct.users.map((user: any) => user.email);
          // Send email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error) {
    throw new Error(`Error in get Request ^${error}`);
  }
}
