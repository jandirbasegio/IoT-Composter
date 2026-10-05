import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  adicionarAnimal,
  buscarCicloAtual,
  fecharCelula,
  iniciarCiclo,
  iniciarMaturacao,
  mensagemDeErro,
} from '../services/api';
import type { Ciclo } from '../types';

export function useCiclo() {
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const recarregar = useCallback(async () => {
    try {
      setCiclo(await buscarCicloAtual());
    } catch {
      // Falha de rede já é sinalizada pelo carregamento das leituras.
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  /** Executa uma ação do ciclo, mostrando a mensagem da API em caso de erro. */
  const executar = useCallback(
    async (acao: () => Promise<unknown>) => {
      setOcupado(true);
      try {
        await acao();
        await recarregar();
        return true;
      } catch (err) {
        Alert.alert('Não foi possível concluir', mensagemDeErro(err));
        return false;
      } finally {
        setOcupado(false);
      }
    },
    [recarregar],
  );

  return {
    ciclo,
    ocupado,
    recarregar,
    iniciar: () => executar(iniciarCiclo),
    adicionar: (pesoKg: number) => executar(() => adicionarAnimal(pesoKg)),
    fechar: () => executar(fecharCelula),
    maturar: () => executar(iniciarMaturacao),
  };
}
