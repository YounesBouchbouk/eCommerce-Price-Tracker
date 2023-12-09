"use server"

import Product from "../models/product.model";
import { ConnectToDB } from "../mongoose";
import { scapeAmazonProduct } from "../scraper"


export async function scrapeAndStoreProduct(productUrl: string) {

    
    if(!productUrl) return

    try {
        console.log("Let try to connect to db ....");
        ConnectToDB()

        const scrapedProduct = await scapeAmazonProduct(productUrl)
        if (!scrapedProduct) return;


        const existingProduct = await Product.findOne({
            url : scrapedProduct.url
        })

        
        




    } catch (error) {
        throw new Error(`faild to create or update prosuct ${error}`)
    }
    
}