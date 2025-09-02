import { addJobToQueue } from '@/tasks/queue';
import { ListMonkTask } from '@/types';
import { logger } from '@/utils/logger';

export class ListMonkQueueService {
  /**
   * Add a subscribe job to the queue
   */
  static async subscribeToList(
    listId: string | number,
    email: string,
    subscriber?: Partial<any>,
    options?: {
      delay?: number;
      priority?: number;
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ) {
    const task: ListMonkTask = {
      action: 'subscribe',
      data: {
        email,
        listId,
        subscriber
      },
      options: {
        retryOnFailure: options?.retryOnFailure ?? true,
        notifyOnFailure: options?.notifyOnFailure ?? false,
        priority: options?.priority === 'high' ? 'high' : 'normal'
      }
    };

    logger.info('Adding ListMonk subscribe job to queue', {
      email,
      listId,
      hasSubscriber: !!subscriber
    });

    return await addJobToQueue('LISTMONK', task, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0
    });
  }

  /**
   * Add an unsubscribe job to the queue
   */
  static async unsubscribeFromList(
    listId: string | number,
    email: string,
    options?: {
      delay?: number;
      priority?: number;
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ) {
    const task: ListMonkTask = {
      action: 'unsubscribe',
      data: {
        email,
        listId
      },
      options: {
        retryOnFailure: options?.retryOnFailure ?? true,
        notifyOnFailure: options?.notifyOnFailure ?? false,
        priority: options?.priority === 'high' ? 'high' : 'normal'
      }
    };

    logger.info('Adding ListMonk unsubscribe job to queue', {
      email,
      listId
    });

    return await addJobToQueue('LISTMONK', task, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0
    });
  }

  /**
   * Add an update subscriber job to the queue
   */
  static async updateSubscriber(
    subscriberId: string,
    subscriber: Partial<any>,
    options?: {
      delay?: number;
      priority?: number;
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ) {
    const task: ListMonkTask = {
      action: 'update',
      data: {
        subscriberId,
        subscriber
      },
      options: {
        retryOnFailure: options?.retryOnFailure ?? true,
        notifyOnFailure: options?.notifyOnFailure ?? false,
        priority: options?.priority === 'high' ? 'high' : 'normal'
      }
    };

    logger.info('Adding ListMonk update subscriber job to queue', {
      subscriberId,
      hasSubscriber: !!subscriber
    });

    return await addJobToQueue('LISTMONK', task, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0
    });
  }

  /**
   * Add a create subscriber job to the queue
   */
  static async createSubscriber(
    subscriber: Partial<any>,
    options?: {
      delay?: number;
      priority?: number;
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ) {
    const task: ListMonkTask = {
      action: 'create',
      data: {
        subscriber
      },
      options: {
        retryOnFailure: options?.retryOnFailure ?? true,
        notifyOnFailure: options?.notifyOnFailure ?? false,
        priority: options?.priority === 'high' ? 'high' : 'normal'
      }
    };

    logger.info('Adding ListMonk create subscriber job to queue', {
      email: subscriber.email,
      hasSubscriber: !!subscriber
    });

    return await addJobToQueue('LISTMONK', task, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0
    });
  }

  /**
   * Add a delete subscriber job to the queue
   */
  static async deleteSubscriber(
    subscriberId: string,
    options?: {
      delay?: number;
      priority?: number;
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ) {
    const task: ListMonkTask = {
      action: 'delete',
      data: {
        subscriberId
      },
      options: {
        retryOnFailure: options?.retryOnFailure ?? true,
        notifyOnFailure: options?.notifyOnFailure ?? false,
        priority: options?.priority === 'high' ? 'high' : 'normal'
      }
    };

    logger.info('Adding ListMonk delete subscriber job to queue', {
      subscriberId
    });

    return await addJobToQueue('LISTMONK', task, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0
    });
  }

  /**
   * Add a sync job to the queue
   */
  static async sync(
    data?: any,
    options?: {
      delay?: number;
      priority?: number;
      retryOnFailure?: boolean;
      notifyOnFailure?: boolean;
    }
  ) {
    const task: ListMonkTask = {
      action: 'sync',
      data: data || {},
      options: {
        retryOnFailure: options?.retryOnFailure ?? true,
        notifyOnFailure: options?.notifyOnFailure ?? false,
        priority: options?.priority === 'high' ? 'high' : 'normal'
      }
    };

    logger.info('Adding ListMonk sync job to queue');

    return await addJobToQueue('LISTMONK', task, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0
    });
  }

  /**
   * Add a custom ListMonk job to the queue
   */
  static async addCustomJob(
    task: ListMonkTask,
    options?: {
      delay?: number;
      priority?: number;
    }
  ) {
    logger.info('Adding custom ListMonk job to queue', {
      action: task.action,
      email: task.data.email,
      listId: task.data.listId,
      subscriberId: task.data.subscriberId
    });

    return await addJobToQueue('LISTMONK', task, {
      delay: options?.delay,
      priority: options?.priority === 'high' ? 1 : 0
    });
  }
}
