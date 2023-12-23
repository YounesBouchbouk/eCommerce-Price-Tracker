"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { ConnectToDB } from "../mongoose";
import { scapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "../../types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    ConnectToDB();

    const scrapedProduct = await scapeAmazonProduct(productUrl);
    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({
      url: scrapedProduct.url,
    });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: Number(scrapedProduct.currentPrice) },
      ];
      product = {
        ...product,
        priceHistory: updatedPriceHistory,
        averagePrice: getAveragePrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        lowestPrice: getLowestPrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    console.log(product);
    

    revalidatePath(`/products/${newProduct._id}`);

    return product
  } catch (error) {
    throw new Error(`faild to create or update prosuct ${error}`);
  }
}

export async function getProductById(productId: string) {
  try {
    ConnectToDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    ConnectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  }
}


export async function getSimilarProducts(productId: string) {
  try {
    ConnectToDB();

    const currentProduct = await Product.findById(productId);

    if(!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(3);

    return similarProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}

