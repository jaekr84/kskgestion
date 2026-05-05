export interface Province {
  id: string;
  nombre: string;
}

export interface Locality {
  id: string;
  nombre: string;
}

export async function getProvinces(): Promise<Province[]> {
  const response = await fetch("https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre");
  const data = await response.json();
  return data.provincias.sort((a: Province, b: Province) => a.nombre.localeCompare(b.nombre));
}

export async function getLocalities(provinceId: string): Promise<Locality[]> {
  // CABA is ID "02". For CABA, we use 'localidades' to get neighborhoods.
  // For other provinces, 'municipios' is usually better for Cities/Towns.
  const endpoint = provinceId === "02" ? "localidades" : "municipios";
  
  const response = await fetch(
    `https://apis.datos.gob.ar/georef/api/${endpoint}?provincia=${provinceId}&campos=id,nombre&max=1000`
  );
  const data = await response.json();
  const results = data[endpoint] || [];
  
  return results.sort((a: Locality, b: Locality) => a.nombre.localeCompare(b.nombre));
}
