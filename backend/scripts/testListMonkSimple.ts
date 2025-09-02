#!/usr/bin/env tsx

// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { ListMonkService } from '../src/services/listmonkService';
import { ListMonkConfig } from '../src/types';

async function testListMonkSimple() {
  console.log('🔍 Simple ListMonk Connection Test\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('=' .repeat(50));
  
  const baseUrl = process.env.LISTMONK_BASE_URL;
  const username = process.env.LISTMONK_USERNAME;
  const password = process.env.LISTMONK_PASSWORD;
  const timeout = process.env.LISTMONK_TIMEOUT;
  
  console.log(`LISTMONK_BASE_URL: ${baseUrl || 'NOT SET'}`);
  console.log(`LISTMONK_USERNAME: ${username || 'NOT SET'}`);
  console.log(`LISTMONK_PASSWORD: ${password ? '***' : 'NOT SET'}`);
  console.log(`LISTMONK_TIMEOUT: ${timeout || 'NOT SET'}`);

  if (!baseUrl || !username || !password) {
    console.log('\n❌ Missing required environment variables');
    return;
  }

  // Create service
  console.log('\n🔧 Creating ListMonk Service');
  console.log('=' .repeat(50));
  
  const config: ListMonkConfig = {
    baseUrl,
    username,
    password,
    timeout: timeout ? parseInt(timeout) : 30000
  };

  try {
    const service = new ListMonkService(config);
    console.log('✅ Service created successfully');
    
    const configInfo = service.getConfigurationInfo();
    console.log(`Base URL: ${configInfo.baseUrl}`);
    console.log(`Username: ${configInfo.username}`);
    console.log(`Has Password: ${configInfo.hasPassword}`);
    
  } catch (error) {
    console.log('❌ Failed to create service');
    console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return;
  }

  // Test health check
  console.log('\n🏥 Testing Health Check');
  console.log('=' .repeat(50));
  
  try {
    const service = new ListMonkService(config);
    const isHealthy = await service.healthCheck();
    console.log(`Health Check: ${isHealthy ? '✅ PASSED' : '❌ FAILED'}`);
  } catch (error) {
    console.log('❌ Health check failed');
    console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test basic API call
  console.log('\n🌐 Testing API Call');
  console.log('=' .repeat(50));
  
  try {
    const service = new ListMonkService(config);
    console.log('Making API call to get lists...');
    const lists = await service.getLists();
    console.log(`✅ Successfully retrieved ${lists.length} lists`);
    
    if (lists.length > 0) {
      console.log('Sample list:');
      console.log(`  ID: ${lists[0].id}`);
      console.log(`  Name: ${lists[0].name}`);
      console.log(`  Type: ${lists[0].type}`);
    }
  } catch (error) {
    console.log('❌ API call failed');
    console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test subscriber lookup
  console.log('\n👥 Testing Subscriber Lookup');
  console.log('=' .repeat(50));
  
  try {
    const service = new ListMonkService(config);
    const testEmail = 'amj6535@psu.edu';
    console.log(`Looking up subscriber: ${testEmail}`);
    
    // Test the paginated search
    console.log('Testing paginated subscriber search...');
    const subscriber = await service.getSubscriberByEmail(testEmail);
    
    if (subscriber) {
      console.log('✅ Subscriber found');
      console.log(`  ID: ${subscriber.id}`);
      console.log(`  Email: ${subscriber.email}`);
      console.log(`  Status: ${subscriber.status}`);
      console.log(`  Lists: ${subscriber.lists.length}`);
      
      // Check newsletter list ID
      const newsletterListId = process.env.LISTMONK_NEWSLETTER_LIST_ID;
      if (newsletterListId) {
        const isSubscribedToNewsletter = subscriber.lists.includes(parseInt(newsletterListId));
        console.log(`  Newsletter List ID: ${newsletterListId}`);
        console.log(`  Subscribed to Newsletter: ${isSubscribedToNewsletter ? 'Yes' : 'No'}`);
      }
    } else {
      console.log('ℹ️  Subscriber not found');
      
      // Let's debug by getting all subscribers and searching manually
      console.log('\n🔍 Debugging: Getting all subscribers...');
      try {
        const allSubscribers = await service.listSubscribers();
        console.log(`Total subscribers retrieved: ${allSubscribers.length}`);
        
        // Search for the email manually
        const foundSubscriber = allSubscribers.find(sub => sub.email === testEmail);
        if (foundSubscriber) {
          console.log('✅ Found subscriber in manual search!');
          console.log(`  ID: ${foundSubscriber.id}`);
          console.log(`  Email: ${foundSubscriber.email}`);
          console.log(`  Status: ${foundSubscriber.status}`);
          console.log(`  Lists: ${foundSubscriber.lists.length}`);
          
          // Check newsletter list ID
          const newsletterListId = process.env.LISTMONK_NEWSLETTER_LIST_ID;
          if (newsletterListId) {
            const isSubscribedToNewsletter = foundSubscriber.lists.includes(parseInt(newsletterListId));
            console.log(`  Newsletter List ID: ${newsletterListId}`);
            console.log(`  Subscribed to Newsletter: ${isSubscribedToNewsletter ? 'Yes' : 'No'}`);
          }
        } else {
          console.log('❌ Subscriber not found even in manual search');
          
          // Show some sample emails for debugging
          if (allSubscribers.length > 0) {
            console.log('Sample emails in system:');
            allSubscribers.slice(0, 5).forEach((sub, index) => {
              console.log(`  ${index + 1}. ${sub.email}`);
            });
            
            // Search for any email containing "amj6535"
            const partialMatch = allSubscribers.find(sub => sub.email.includes('amj6535'));
            if (partialMatch) {
              console.log(`✅ Found partial match: ${partialMatch.email}`);
            }
            
            // Check if we need to get more subscribers (pagination)
            console.log(`\nTotal subscribers retrieved: ${allSubscribers.length}`);
            console.log('Note: ListMonk shows 554 subscribers in the Newsletter list, but we only retrieved 20.');
            console.log('This suggests pagination is limiting results.');
            
                         // Try to get more subscribers with a higher limit
             console.log('\n🔍 Trying to get more subscribers with limit=100...');
             try {
               const moreSubscribers = await service.listSubscribers({ limit: 100 });
               console.log(`Retrieved ${moreSubscribers.length} subscribers with limit=100`);
               
               const foundInMore = moreSubscribers.find(sub => sub.email === testEmail);
               if (foundInMore) {
                 console.log('✅ Found subscriber in expanded search!');
                 console.log(`  ID: ${foundInMore.id}`);
                 console.log(`  Email: ${foundInMore.email}`);
                 console.log(`  Status: ${foundInMore.status}`);
                 console.log(`  Lists: ${foundInMore.lists.length}`);
                 
                 // Check newsletter list ID
                 const newsletterListId = process.env.LISTMONK_NEWSLETTER_LIST_ID;
                 if (newsletterListId) {
                   const isSubscribedToNewsletter = foundInMore.lists.includes(parseInt(newsletterListId));
                   console.log(`  Newsletter List ID: ${newsletterListId}`);
                   console.log(`  Subscribed to Newsletter: ${isSubscribedToNewsletter ? 'Yes' : 'No'}`);
                 }
               } else {
                 console.log('❌ Still not found in expanded search');
                 
                 // Search for partial match in expanded results
                 const partialMatchInMore = moreSubscribers.find(sub => sub.email.includes('amj6535'));
                 if (partialMatchInMore) {
                   console.log(`✅ Found partial match in expanded search: ${partialMatchInMore.email}`);
                 }
               }
             } catch (moreError) {
               console.log('❌ Expanded search failed');
               console.log(`Error: ${moreError instanceof Error ? moreError.message : 'Unknown error'}`);
             }
             
             // Try to get subscribers specifically from the newsletter list
             console.log('\n🔍 Trying to get subscribers from newsletter list (ID: 3)...');
             try {
               const newsletterSubscribers = await service.listSubscribers({ list_id: 3 });
               console.log(`Retrieved ${newsletterSubscribers.length} subscribers from newsletter list`);
               
               const foundInNewsletter = newsletterSubscribers.find(sub => sub.email === testEmail);
               if (foundInNewsletter) {
                 console.log('✅ Found subscriber in newsletter list!');
                 console.log(`  ID: ${foundInNewsletter.id}`);
                 console.log(`  Email: ${foundInNewsletter.email}`);
                 console.log(`  Status: ${foundInNewsletter.status}`);
                 console.log(`  Lists: ${foundInNewsletter.lists.length}`);
                 
                 // Check newsletter list ID
                 const newsletterListId = process.env.LISTMONK_NEWSLETTER_LIST_ID;
                 if (newsletterListId) {
                   const isSubscribedToNewsletter = foundInNewsletter.lists.includes(parseInt(newsletterListId));
                   console.log(`  Newsletter List ID: ${newsletterListId}`);
                   console.log(`  Subscribed to Newsletter: ${isSubscribedToNewsletter ? 'Yes' : 'No'}`);
                 }
               } else {
                 console.log('❌ Not found in newsletter list');
                 
                 // Show some sample emails from newsletter list
                 if (newsletterSubscribers.length > 0) {
                   console.log('Sample emails from newsletter list:');
                   newsletterSubscribers.slice(0, 5).forEach((sub, index) => {
                     console.log(`  ${index + 1}. ${sub.email}`);
                   });
                 }
               }
                            } catch (newsletterError) {
                 console.log('❌ Newsletter list search failed');
                 console.log(`Error: ${newsletterError instanceof Error ? newsletterError.message : 'Unknown error'}`);
               }
               
                            // Try to get subscribers with offset to see more of the list
             console.log('\n🔍 Trying to get subscribers with page=2...');
             try {
               const offsetSubscribers = await service.listSubscribers({ list_id: 3, page: 2 });
                                console.log(`Retrieved ${offsetSubscribers.length} subscribers with page=2`);
               
               const foundInOffset = offsetSubscribers.find(sub => sub.email === testEmail);
               if (foundInOffset) {
                 console.log('✅ Found subscriber with page=2!');
                   console.log(`  ID: ${foundInOffset.id}`);
                   console.log(`  Email: ${foundInOffset.email}`);
                   console.log(`  Status: ${foundInOffset.status}`);
                   console.log(`  Lists: ${foundInOffset.lists.length}`);
                   
                   // Check newsletter list ID
                   const newsletterListId = process.env.LISTMONK_NEWSLETTER_LIST_ID;
                   if (newsletterListId) {
                     const isSubscribedToNewsletter = foundInOffset.lists.includes(parseInt(newsletterListId));
                     console.log(`  Newsletter List ID: ${newsletterListId}`);
                     console.log(`  Subscribed to Newsletter: ${isSubscribedToNewsletter ? 'Yes' : 'No'}`);
                   }
                 } else {
                   console.log('❌ Not found with page=2');
                   
                   // Show some sample emails from page 2 results
                   if (offsetSubscribers.length > 0) {
                     console.log('Sample emails with page=2:');
                     offsetSubscribers.slice(0, 5).forEach((sub, index) => {
                       console.log(`  ${index + 1}. ${sub.email}`);
                     });
                   }
                 }
               } catch (offsetError) {
                 console.log('❌ Offset search failed');
                 console.log(`Error: ${offsetError instanceof Error ? offsetError.message : 'Unknown error'}`);
               }
          }
        }
      } catch (debugError) {
        console.log('❌ Debug search failed');
        console.log(`Error: ${debugError instanceof Error ? debugError.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.log('❌ Subscriber lookup failed');
    console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test newsletter status logic
  console.log('\n📧 Testing Newsletter Status Logic');
  console.log('=' .repeat(50));
  
  try {
    const service = new ListMonkService(config);
    const newsletterListId = process.env.LISTMONK_NEWSLETTER_LIST_ID;
    
    if (!newsletterListId) {
      console.log('❌ LISTMONK_NEWSLETTER_LIST_ID not set');
      return;
    }
    
    console.log(`Newsletter List ID: ${newsletterListId}`);
    
    // Test with a non-existent email
    const testEmail = 'test@example.com';
    console.log(`Testing newsletter status for: ${testEmail}`);
    
    const subscriber = await service.getSubscriberByEmail(testEmail);
    let subscribed = false;
    
    if (subscriber) {
      subscribed = subscriber.lists.some(listId => listId === parseInt(newsletterListId));
      console.log(`✅ Subscriber found, newsletter status: ${subscribed}`);
    } else {
      console.log('ℹ️  Subscriber not found, newsletter status: false');
    }
    
    console.log(`Final newsletter status: ${subscribed}`);
    
  } catch (error) {
    console.log('❌ Newsletter status test failed');
    console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  console.log('\n🏁 Test completed');
}

// Run the test
testListMonkSimple().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
