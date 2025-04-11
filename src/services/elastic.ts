import { Client } from '@elastic/elasticsearch';
import { elasticConfig } from '@/config/elastic';

const client = new Client({
  ...elasticConfig,
});

// Index name for plans
const PLAN_INDEX = 'plans';
const PLAN_SERVICE_INDEX = 'plan_services';

export const initializeElastic = async () => {
  try {
    const planIndexExists = await client.indices.exists({ index: PLAN_INDEX });
    const planServiceIndexExists = await client.indices.exists({ index: PLAN_SERVICE_INDEX });

    if (!planIndexExists) {
      await client.indices.create({
        index: PLAN_INDEX,
        mappings: {
          properties: {
            objectId: { type: 'keyword' },
            objectType: { type: 'keyword' },
            planType: { type: 'keyword' },
            creationDate: { type: 'keyword' },
            _org: { type: 'keyword' }
          }
        },
      });
      console.log(`Created ${PLAN_INDEX} index`);
    }

    if (!planServiceIndexExists) {
      await client.indices.create({
        index: PLAN_SERVICE_INDEX,
        mappings: {
          properties: {
            objectId: { type: 'keyword' },
            objectType: { type: 'keyword' },
            _org: { type: 'keyword' },
            planId: { type: 'keyword' },
            serviceName: { type: 'text' }
          }
        },
      });
      console.log(`Created ${PLAN_SERVICE_INDEX} index`);
    }

    console.log('Elasticsearch indices initialized');
  } catch (error) {
    console.error('Error initializing Elasticsearch indices:', error);
  }
};

export const indexPlan = async (plan: any) => {
  try {
    await client.index({
      index: PLAN_INDEX,
      id: plan.objectId,
      document: {
        objectId: plan.objectId,
        objectType: plan.objectType,
        planType: plan.planType,
        creationDate: plan.creationDate,
        _org: plan._org
      },
      refresh: true
    });

    if (plan.linkedPlanServices && Array.isArray(plan.linkedPlanServices)) {
      for (const service of plan.linkedPlanServices) {
        await client.index({
          index: PLAN_SERVICE_INDEX,
          id: service.objectId,
          document: {
            objectId: service.objectId,
            objectType: service.objectType,
            _org: service._org,
            planId: plan.objectId,
            serviceName: service.linkedService.name
          },
          refresh: true
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error indexing plan:', error);
    throw error;
  }
};

export const updatePlanIndex = async (plan: any) => {
  try {
    const exists = await client.exists({
      index: PLAN_INDEX,
      id: plan.objectId
    });

    if (!exists) {
      return await indexPlan(plan);
    }

    await client.update({
      index: PLAN_INDEX,
      id: plan.objectId,
      doc: {
        objectId: plan.objectId,
        objectType: plan.objectType,
        planType: plan.planType,
        creationDate: plan.creationDate,
        _org: plan._org
      },
      refresh: true
    });

    if (plan.linkedPlanServices && Array.isArray(plan.linkedPlanServices)) {
      const existingServices = await client.search({
        index: PLAN_SERVICE_INDEX,
        query: {
          term: {
            planId: plan.objectId
          }
        }
      });

      const existingServiceIds = existingServices.hits.hits.map((hit) => hit._id);
      const updatedServiceIds = plan.linkedPlanServices.map((service: any) => service.objectId);

      for (const serviceId of existingServiceIds) {
        if (!updatedServiceIds.includes(serviceId)) {
          await client.delete({
            index: PLAN_SERVICE_INDEX,
            id: serviceId,
            refresh: true
          });
        }
      }

      for (const service of plan.linkedPlanServices) {
        await client.index({
          index: PLAN_SERVICE_INDEX,
          id: service.objectId,
          document: {
            objectId: service.objectId,
            objectType: service.objectType,
            _org: service._org,
            planId: plan.objectId,
            serviceName: service.linkedService.name
          },
          refresh: true
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating plan index:', error);
    throw error;
  }
};

export const deletePlanIndex = async (objectId: string) => {
  try {
    const exists = await client.exists({
      index: PLAN_INDEX,
      id: objectId,
    });

    if (!exists) {
      console.log("Plan index not found")
      return;
    }

    await client.delete({
      index: PLAN_INDEX,
      id: objectId,
      refresh: true
    });

    await client.deleteByQuery({
      index: PLAN_SERVICE_INDEX,
      query: {
        term: {
          planId: objectId
        }
      },
      refresh: true
    });

    return true;
  } catch (error) {
    console.error('Error deleting plan index:', error);
    throw error;
  }
};

export const searchPlans = async (query: string) => {
  try {
    const result = await client.search({
      index: PLAN_INDEX,
      query: {
        multi_match: {
          query,
          fields: ['planType', 'objectType']
        }
      }
    });

    return result.hits.hits;
  } catch (error) {
    console.error('Error searching plans:', error);
    throw error;
  }
};

export const getServicesByPlanId = async (planId: string) => {
  try {
    const result = await client.search({
      index: PLAN_SERVICE_INDEX,
      query: {
        term: {
          planId
        }
      }
    });

    return result.hits.hits;
  } catch (error) {
    console.error('Error getting services by plan ID:', error);
    throw error;
  }
};

export default {
  initializeElastic,
  indexPlan,
  updatePlanIndex,
  deletePlanIndex,
  searchPlans,
  getServicesByPlanId
};