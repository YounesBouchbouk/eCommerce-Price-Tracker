"use server"

import { scapeAmazonProduct } from "../scraper"


export async function scrapeAndStoreProduct(productUrl: string) {

    
    if(!productUrl) return

    try {
        const scrapedProduct = await scapeAmazonProduct(productUrl)

        if (!scrapedProduct) return;

        
    } catch (error) {
        throw new Error(`faild to create or update prosuct ${error}`)
    }
    
}