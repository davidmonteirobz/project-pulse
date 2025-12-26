import { createContext, useContext, useState, ReactNode } from "react";
import { Demand, DemandStatus, demands as initialDemands } from "@/data/mockData";

interface DemandsContextType {
  demands: Demand[];
  addDemand: (demand: Demand) => void;
  updateDemandStatus: (demandId: string, status: DemandStatus) => void;
  deleteDemand: (demandId: string) => void;
}

const DemandsContext = createContext<DemandsContextType | undefined>(undefined);

export function DemandsProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<Demand[]>(initialDemands);

  const addDemand = (demand: Demand) => {
    setDemands(prev => [demand, ...prev]);
  };

  const updateDemandStatus = (demandId: string, status: DemandStatus) => {
    setDemands(prev => prev.map(d => 
      d.id === demandId ? { ...d, status } : d
    ));
  };

  const deleteDemand = (demandId: string) => {
    setDemands(prev => prev.filter(d => d.id !== demandId));
  };

  return (
    <DemandsContext.Provider value={{ demands, addDemand, updateDemandStatus, deleteDemand }}>
      {children}
    </DemandsContext.Provider>
  );
}

export function useDemands() {
  const context = useContext(DemandsContext);
  if (!context) {
    throw new Error("useDemands must be used within a DemandsProvider");
  }
  return context;
}