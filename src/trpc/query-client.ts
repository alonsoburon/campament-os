import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // OPTIMIZACIÓN: Cachear datos por 5 minutos para reducir queries
        // Los datos se consideran "frescos" durante este tiempo
        staleTime: 5 * 60 * 1000, // 5 minutos
        
        // Mantener los datos en cache por 10 minutos aunque no se usen
        gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
        
        // NO refetch automático al enfocar la ventana
        // Esto evita queries innecesarias al cambiar de pestaña
        refetchOnWindowFocus: false,
        
        // NO refetch automático al reconectar
        refetchOnReconnect: false,
        
        // Reintentar solo 1 vez en caso de error (en lugar de 3)
        retry: 1,
        
        // Tiempo de espera para considerar una query como fallida
        retryDelay: 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
