import { Season } from "../../models/season";

export async function createNewSeason() {
  const now = new Date();

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 2);

  const season = await Season.create({
    name: `Season ${now.getFullYear()}-${now.getMonth() + 1}`,
    startDate: now,
    endDate,
    isActive: true,
  });

  console.log("🌱 Nueva temporada creada:", season.name);
  return season;
}

export async function checkSeasonStatus() {
  let activeSeason = await Season.findOne({ isActive: true });

  const now = new Date();

  if (!activeSeason) {
    console.log("⚠️ No existe temporada activa. Creando una nueva...");
    activeSeason = await createNewSeason();
    return activeSeason;
  }

  if (activeSeason.endDate <= now) {
    console.log(`🏁 ${activeSeason.name} terminó. Cerrando...`);

    await Season.updateOne(
      { _id: activeSeason._id },
      { $set: { isActive: false } }
    );

    return await createNewSeason();
  }

  return activeSeason;
}

export function startSeasonWatcher() {
  console.log("⏱️ Season watcher iniciado...");

  checkSeasonStatus().catch((err) =>
    console.error("❌ Error al iniciar temporadas:", err)
  );

  setInterval(() => {
    checkSeasonStatus().catch((err) =>
      console.error("❌ Error verificando temporadas:", err)
    );
  }, 1000 * 60 * 60); 
}
