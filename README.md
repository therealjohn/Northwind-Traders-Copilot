# Northwind Traders copilot for Teams

A sample custom copilot for Teams built for BRK146 at Microsoft Build 2024. [Watch the recording of the session here](https://build.microsoft.com/en-US/sessions/9c884c87-f484-4d63-a33c-d833d5017898?source=sessions).

![Screenshot of the sample extension working in Microsoft Teams](./assets/copilot.png)

> [!IMPORTANT]
> This is a modified version of the [Northwind inventory message extension sample](https://github.com/OfficeDev/Copilot-for-M365-Plugins-Samples/tree/main/samples/msgext-northwind-inventory-ts).
> Set the following variables in your `/env` folder for the environment you're testing with:
>
> - `SECRET_STORAGE_ACCOUNT_CONNECTION_STRING=UseDevelopmentStorage=true`
> - `SECRET_AZURE_OPENAI_API_KEY=YOUR AZURE OPENAI KEY`
> - `AZURE_OPENAI_ENDPOINT=YOUR AZURE OPENAI ENDPOINT`
> - `AZURE_OPENAI_DEPLOYMENT_NAME=YOUR AZURE OPENAI DEPLOYMENT NAME`
> - `SECRET_AZURE_SEARCH_ENDPOINT=YOUR AZURE SEARCH ENDPOINT`
> - `SECRET_AZURE_SEARCH_KEY=YOUR AZURE SEARCH KEY`
> 
> This sample uses Azurite for local Azure storage to contain the sample product data.
> Install the Azurite VS Code extension first so the database script can seed the database.
> 
> An Azure AI Search index was created and named `documents`. This contains the [sample docs](https://github.com/OfficeDev/Copilot-for-M365-Plugins-Samples/tree/main/samples/msgext-northwind-inventory-ts/sampleDocs) in an Azure Blob container.
>
> Next, run `npm install` before attempting to F5.
>
> Azure Open AI is used for the language model. Tested with GPT-4.
> At the time of testing, this required features in the Teams client that are coming soon. If you do not see some of the features, they are not released yet.

## Northwind inventory message extension sample

![License.](https://img.shields.io/badge/license-MIT-green.svg)

This sample implements a Teams message extension that can be used as a plugin for Microsoft Copilot for Microsoft 365. The message extension allows users to query the [Northwind Database](https://learn.microsoft.com/dotnet/framework/data/adonet/sql/linq/downloading-sample-databases).

## Version history

Version|Manifest version|Date|Author|Comments
-------|--|--|----|--------
1.0|1.16|November 15, 2023 |Bob German <br/> Garry Trinder <br/> Rabia Williams|Initial release for Ignite 2023 labs
1.1|1.16|December 7, 2023 |Bob German|Parameters are now passed by name not value

## Prerequisites

- [Node.js 18.x](https://nodejs.org/download/release/v18.18.2/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Teams Toolkit](https://marketplace.visualstudio.com/items?itemName=TeamsDevApp.ms-teams-vscode-extension)
- You will need a Microsoft work or school account with [permissions to upload custom Teams applications](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/prepare-your-o365-tenant#enable-custom-teams-apps-and-turn-on-custom-app-uploading). The account will also need a Microsoft Copilot for Microsoft 365 license to use the extension in Copilot.

## Setup and use the sample

For instructions on setting up and running the sample, see the [lab exercises](./lab/Exercise%2000%20-%20Welcome.md).

## Example prompts for Copilot

Here are some ideas for prompts to try. If you don't get the result you expect, try typing "new chat" and then trying again.

### Single parameter prompts

- *Find Chai in Northwind Inventory*

- *Who supplies discounted produce to Northwind?*

- *Find high revenue products in Northwind. Have there been any ad campaigns for these products?*

  > [!NOTE]
  > The ad campaign details are in the [sample documents](./sampleDocs/).

### Multi-parameter prompts

- *Find northwind dairy products that are low on stock. Show me a table with the product, supplier, units in stock and on order. Reference the details for each product.*

  (then)

  *OK can you draft an email to our procurement team asking them if we've had any delivery issues with these suppliers?*

- *Find Northwind beverages with more than 100 units in stock*

  (then)

  *What are the payment terms for these suppliers?*

  > [!NOTE]
  > The answer to the 2nd question is in the [sample documents](./sampleDocs/).

- *We’ve been receiving partial orders for Tofu. Find the supplier in Northwind and draft an email summarizing our inventory and reminding them they should stop sending partial orders per our MOQ policy.*

  > [!NOTE]
  > The MOQ policy is in one of the [sample documents](./sampleDocs/).

- *Northwind will have a booth at Microsoft Community Days  in London. Find products with local suppliers and write a LinkedIn post to promote the booth and products.*

  (then)

  *Emphasize how delicious the products are and encourage people to visit our booth at the conference*

- *What beverage is high in demand due to social media that is low stock in Northwind in London. Reference the product details to update stock.*

  > [!NOTE]
  > There is a document that discusses a social media campaign for one of the products in the [sample documents](./sampleDocs/).

![](https://m365-visitor-stats.azurewebsites.net/SamplesGallery/officedev-copilot-for-m365-plugins-samples-msgext-northwind-inventory-ts)