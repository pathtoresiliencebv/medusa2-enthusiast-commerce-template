import type { MedusaContainer } from "@medusajs/framework/types";

const ENTHUSIAST_MODULE = "enthusiast";
const DATASET_NAME = "LVRO Catalog";

export default async function connectEnthusiast({
  container,
}: {
  container: MedusaContainer;
}) {
  const enthusiast = container.resolve(ENTHUSIAST_MODULE) as any;

  await enthusiast.isConnected();

  let [dataset] = await enthusiast.listEnthusiastDatasets({
    name: DATASET_NAME,
  });

  if (!dataset) {
    const created = await enthusiast.datasetCreate({
      name: DATASET_NAME,
      preconfigure_agents: false,
    });
    dataset = Array.isArray(created) ? created[0] : created;
  }

  if (!dataset.is_connected) {
    await enthusiast.connectDatasets(dataset.id, container);
    [dataset] = await enthusiast.listEnthusiastDatasets({ id: dataset.id });
  }

  if (dataset.task_id) {
    const taskStatus = await enthusiast.getTaskStatus({
      task_id: dataset.task_id,
      streaming: false,
    });
    if (taskStatus === "SUCCESS" || taskStatus === "FAILURE") {
      await enthusiast.updateEnthusiastDatasets({
        id: dataset.id,
        last_synced: new Date(),
        sync_status: taskStatus === "SUCCESS" ? "success" : "failed",
        task_id: null,
      });
      [dataset] = await enthusiast.listEnthusiastDatasets({ id: dataset.id });
    }
  }

  console.log(
    JSON.stringify({
      dataset: dataset.name,
      connected: dataset.is_connected,
      sync_status: dataset.sync_status,
    }),
  );
}
