#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { prisma } from '../src/models/prismaClient';
import { MemberPaidStatusService } from '../src/services/memberPaidStatusService';
import { logger } from '../src/utils/logger';

async function testMemberPaidStatus() {
  console.log('🧪 Testing Member Paid Status Service...\n');

  try {
    const memberPaidStatusService = new MemberPaidStatusService(prisma);

    // Test 1: Get current member-paid group members
    console.log('1. Getting current member-paid group members...');
    try {
      const members = await memberPaidStatusService.getMemberPaidGroupMembers();
      console.log(`   ✅ Found ${members.length} members in the group`);
      if (members.length > 0) {
        console.log(`   Sample member IDs: ${members.slice(0, 3).join(', ')}`);
      }
    } catch (error) {
      console.log('   ⚠️  Could not get group members (group might not exist yet)');
    }
    console.log();

    // Test 2: Find a test user
    console.log('2. Finding a test user...');
    const testUser = await prisma.user.findFirst({
      where: {
        authentikId: { not: null }
      },
      select: {
        id: true,
        email: true,
        authentikId: true,
        paidStatus: true
      }
    });

    if (!testUser) {
      console.log('   ❌ No users with Authentik IDs found. Please ensure users have logged in via Authentik first.');
      return;
    }

    console.log(`   ✅ Found test user: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`   Current paid status: ${testUser.paidStatus}`);
    console.log(`   Authentik ID: ${testUser.authentikId}`);
    console.log();

    // Test 3: Update paid status (toggle it)
    console.log('3. Testing paid status update...');
    const newPaidStatus = !testUser.paidStatus;
    console.log(`   Updating paid status from ${testUser.paidStatus} to ${newPaidStatus}...`);
    
    try {
      await memberPaidStatusService.updateMemberPaidStatus(testUser.id, newPaidStatus);
      console.log('   ✅ Paid status updated successfully');
      
      // Verify the change
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { paidStatus: true }
      });
      
      if (updatedUser?.paidStatus === newPaidStatus) {
        console.log('   ✅ Database updated correctly');
      } else {
        console.log('   ❌ Database update failed');
      }
    } catch (error) {
      console.log('   ❌ Failed to update paid status:', error instanceof Error ? error.message : error);
    }
    console.log();

    // Test 4: Sync all paid statuses
    console.log('4. Testing full sync...');
    try {
      const syncResult = await memberPaidStatusService.syncAllPaidStatuses();
      console.log(`   ✅ Sync completed: ${syncResult.processed} processed, ${syncResult.errors} errors`);
    } catch (error) {
      console.log('   ❌ Sync failed:', error instanceof Error ? error.message : error);
    }
    console.log();

    // Test 5: Get updated member list
    console.log('5. Getting updated member list...');
    try {
      const updatedMembers = await memberPaidStatusService.getMemberPaidGroupMembers();
      console.log(`   ✅ Found ${updatedMembers.length} members in the group after sync`);
    } catch (error) {
      console.log('   ❌ Could not get updated member list:', error instanceof Error ? error.message : error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMemberPaidStatus().catch(console.error);
