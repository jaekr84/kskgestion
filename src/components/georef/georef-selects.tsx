"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getProvinces, getLocalities, Province, Locality } from "@/lib/georef";

interface GeorefSelectsProps {
  onProvinceChange: (id: string, name: string) => void;
  onLocalityChange: (id: string, name: string) => void;
  initialProvinceName?: string;
  initialLocalityName?: string;
}

export function GeorefSelects({ 
  onProvinceChange, 
  onLocalityChange,
  initialProvinceName,
  initialLocalityName
}: GeorefSelectsProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("");
  const [selectedLocalityName, setSelectedLocalityName] = useState<string>("");

  useEffect(() => {
    getProvinces().then((data) => {
      setProvinces(data);
      if (initialProvinceName) {
        setSelectedProvinceName(initialProvinceName);
      }
    });
  }, [initialProvinceName]);

  useEffect(() => {
    const province = provinces.find(p => p.nombre === selectedProvinceName);
    if (province) {
      getLocalities(province.id).then((data) => {
        setLocalities(data);
        if (initialLocalityName) {
          setSelectedLocalityName(initialLocalityName);
        }
      });
    } else {
      setLocalities([]);
      setSelectedLocalityName("");
    }
  }, [selectedProvinceName, provinces, initialLocalityName]);

  const handleProvinceSelect = (name: string) => {
    setSelectedProvinceName(name);
    setSelectedLocalityName("");
    const province = provinces.find((p) => p.nombre === name);
    if (province) {
      onProvinceChange(province.id, province.nombre);
    }
  };

  const handleLocalitySelect = (name: string) => {
    setSelectedLocalityName(name);
    const locality = localities.find((l) => l.nombre === name);
    if (locality) {
      onLocalityChange(locality.id, locality.nombre);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="province">Provincia</Label>
        <Select 
          value={selectedProvinceName}
          onValueChange={handleProvinceSelect}
        >
          <SelectTrigger id="province" className="h-11 w-full text-base md:text-sm bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Seleccionar provincia" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.nombre}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locality">Localidad / Municipio</Label>
        <Select 
          value={selectedLocalityName}
          onValueChange={handleLocalitySelect} 
          disabled={!selectedProvinceName}
        >
          <SelectTrigger id="locality" className="h-11 w-full text-base md:text-sm bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder={selectedProvinceName ? "Seleccionar localidad" : "Primero elige provincia"} />
          </SelectTrigger>
          <SelectContent>
            {localities.map((l) => (
              <SelectItem key={l.id} value={l.nombre}>
                {l.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
