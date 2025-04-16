import { Client } from '@elastic/elasticsearch';
import { elasticConfig } from '@/config/elastic';

const client = new Client({
  ...elasticConfig,
});

// Index name for plans
const PLAN_INDEX = 'plans';

export const initializeElasticsearch = async () => {
  try {
    const planIndexExists = await client.indices.exists({
      index: PLAN_INDEX
    });

    if (!planIndexExists) {
      await client.indices.create({
        index: PLAN_INDEX,
        body: {
          mappings: {
            properties: {
              plan_service_relation: {
                type: "join",
                relations: {
                  "plan": "service" // plan is parent, service is child
                }
              },
              objectId: { type: "keyword" },
              objectType: { type: "keyword" },
              planType: { type: "keyword" },
              creationDate: { type: "keyword" },
              _org: { type: "keyword" },
              planCostShares: {
                properties: {
                  deductible: { type: "integer" },
                  copay: { type: "integer" },
                  objectId: { type: "keyword" },
                  objectType: { type: "keyword" },
                  _org: { type: "keyword" }
                }
              },
              serviceName: { type: "text" },
              serviceObjectId: { type: "keyword" },
              deductible: { type: "integer" },
              copay: { type: "integer" }
            }
          }
        }
      });

      console.log(`Created ${PLAN_INDEX} index with parent-child relationship`);
    }

    console.log("Elasticsearch initialized successfully");
  } catch (error) {
    console.error("Error initializing Elasticsearch:", error);
    throw error;
  }
};

export const indexPlan = async (plan: any) => {
  try {
    await client.index({
      index: PLAN_INDEX,
      id: plan.objectId,
      document: {
        ...plan,
        plan_service_relation: {
          name: "plan"
        }
      },
      refresh: true
    });

    if (plan.linkedPlanServices && Array.isArray(plan.linkedPlanServices)) {
      for (const service of plan.linkedPlanServices) {
        await client.index({
          index: PLAN_INDEX,
          id: service.objectId,
          routing: plan.objectId, // Important: routing ensures child is stored with parent
          document: {
            serviceObjectId: service.objectId,
            objectType: service.objectType,
            _org: service._org,
            serviceName: service.linkedService.name,
            deductible: service.planserviceCostShares.deductible,
            copay: service.planserviceCostShares.copay,
            plan_service_relation: {
              name: "service",
              parent: plan.objectId
            }
          },
          refresh: true
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error indexing plan:", error);
    throw error;
  }
};

// Update a plan document
export const updatePlanIndex = async (objectId: string, plan: any) => {
  try {
    await deletePlanFromIndex(objectId);
    await indexPlan(plan);

    return true;
  } catch (error) {
    console.error("Error updating plan in index:", error);
    throw error;
  }
};

export const deletePlanFromIndex = async (objectId: string) => {
  try {
    await client.deleteByQuery({
      index: PLAN_INDEX,
      body: {
        query: {
          has_parent: {
            parent_type: "plan",
            query: {
              match: {
                objectId: objectId
              }
            }
          }
        }
      },
      refresh: true
    });

    await client.delete({
      index: PLAN_INDEX,
      id: objectId,
      refresh: true
    });

    return true;
  } catch (error) {
    console.error("Error deleting plan from index:", error);
    throw error;
  }
};

export const searchPlans = async (query: any) => {
  try {
    const response = await client.search({
      index: PLAN_INDEX,
      body: query
    });

    return response.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error("Error searching plans:", error);
    throw error;
  }
};

export const searchPlansByServiceName = async (serviceName: string) => {
  try {
    const response = await client.search({
      index: PLAN_INDEX,
      body: {
        query: {
          has_child: {
            type: "service",
            query: {
              match: {
                serviceName: serviceName
              }
            }
          }
        }
      }
    });

    return response.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error("Error searching plans by service:", error);
    throw error;
  }
};