import { useCallback, useEffect, useState } from 'react';
import { buscarLeituras } from '../services/api';
import type { Leitura } from '../types';

export function useLeituras() {
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLeituras(await buscarLeituras());
      setErro(null);
    } catch {
      setErro('Não foi possível carregar as leituras. Verifique o IP da API e a rede.');
    }
  }, []);

  useEffect(() => {
    carregar().finally(() => setLoading(false));
  }, [carregar]);

  const atualizar = useCallback(async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }, [carregar]);

  return { leituras, loading, refreshing, erro, atualizar };
}
