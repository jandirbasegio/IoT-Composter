import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';
import type { Ciclo, StatusCiclo } from '../types';
import { formatarDataHora } from '../utils/status';

interface Props {
  ciclo: Ciclo | null;
  ocupado: boolean;
  onIniciar: () => void;
  onAdicionarAnimal: () => void;
  onFechar: () => void;
  onMaturar: () => void;
}

const ROTULOS: Record<StatusCiclo, { texto: string; cor: string; descricao: string }> = {
  ENCHIMENTO: {
    texto: 'Enchimento',
    cor: colors.baixo,
    descricao: 'Célula aberta: adicione os animais e feche quando terminar.',
  },
  ATIVA: {
    texto: 'Ativa',
    cor: colors.normal,
    descricao: 'Célula fechada e em compostagem. Alertas de temperatura e gás habilitados.',
  },
  MATURACAO: {
    texto: 'Maturação',
    cor: colors.medio,
    descricao: 'Ciclo em maturação.',
  },
};

const MS_DIA = 24 * 60 * 60 * 1000;

function diasDecorridos(ciclo: Ciclo): number {
  if (!ciclo.dataFechamento) return 0;
  return Math.max(0, Math.floor((Date.now() - ciclo.dataFechamento.getTime()) / MS_DIA));
}

function Botao({
  texto,
  onPress,
  desabilitado,
  variante = 'primario',
}: {
  texto: string;
  onPress: () => void;
  desabilitado: boolean;
  variante?: 'primario' | 'secundario';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      style={[styles.botao, variante === 'primario' ? styles.primario : styles.secundario, desabilitado && styles.off]}
    >
      <Text style={variante === 'primario' ? styles.textoPrimario : styles.textoSecundario}>{texto}</Text>
    </Pressable>
  );
}

export function CicloPanel({ ciclo, ocupado, onIniciar, onAdicionarAnimal, onFechar, onMaturar }: Props) {
  const info = ciclo ? ROTULOS[ciclo.status] : null;
  const decorridos = ciclo ? diasDecorridos(ciclo) : 0;
  const estimados = ciclo?.diasEstimados ?? null;
  const progresso = estimados ? Math.min(1, decorridos / estimados) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Ciclo de compostagem</Text>
        {info ? (
          <View style={[styles.chip, { backgroundColor: info.cor + '1F' }]}>
            <Text style={[styles.chipTexto, { color: info.cor }]}>{info.texto}</Text>
          </View>
        ) : null}
      </View>

      {ciclo && info ? (
        <>
          <Text style={styles.descricao}>{info.descricao}</Text>
          <View style={styles.metricas}>
            <View>
              <Text style={styles.rotulo}>Início</Text>
              <Text style={styles.metrica}>{formatarDataHora(ciclo.dataInicio)}</Text>
            </View>
            <View>
              <Text style={styles.rotulo}>Duração estimada</Text>
              <Text style={styles.metrica}>{estimados ? `${estimados} dias` : '—'}</Text>
            </View>
          </View>

          {ciclo.status === 'ATIVA' && estimados ? (
            <View style={styles.progressoBloco}>
              <View style={styles.trilho}>
                <View style={[styles.preenchimento, { width: `${progresso * 100}%` }]} />
              </View>
              <Text style={styles.progressoTexto}>
                Dia {Math.min(decorridos, estimados)} de {estimados}
              </Text>
            </View>
          ) : null}

          <View style={styles.acoes}>
            {ciclo.status === 'ENCHIMENTO' ? (
              <>
                <Botao texto="+ Animal" onPress={onAdicionarAnimal} desabilitado={ocupado} />
                <Botao texto="Fechar célula" onPress={onFechar} desabilitado={ocupado} variante="secundario" />
              </>
            ) : (
              <Botao texto="Iniciar maturação" onPress={onMaturar} desabilitado={ocupado} variante="secundario" />
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.descricao}>Nenhum ciclo em andamento. Inicie um para começar a registrar animais.</Text>
          <View style={styles.acoes}>
            <Botao texto="Iniciar ciclo" onPress={onIniciar} desabilitado={ocupado} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.superficie, borderRadius: 20, padding: 18, ...shadow },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titulo: { fontSize: 16, fontWeight: '800', color: colors.texto },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  chipTexto: { fontSize: 12, fontWeight: '700' },
  descricao: { fontSize: 13, color: colors.textoSuave, marginTop: 8, lineHeight: 18 },
  metricas: { flexDirection: 'row', gap: 32, marginTop: 14 },
  rotulo: { fontSize: 11, color: colors.textoSuave },
  metrica: { fontSize: 15, fontWeight: '700', color: colors.texto, marginTop: 2 },
  progressoBloco: { marginTop: 16 },
  trilho: { height: 8, borderRadius: 4, backgroundColor: colors.fundo, overflow: 'hidden' },
  preenchimento: { height: 8, borderRadius: 4, backgroundColor: colors.primaria },
  progressoTexto: { fontSize: 12, color: colors.textoSuave, marginTop: 6 },
  acoes: { flexDirection: 'row', gap: 10, marginTop: 16 },
  botao: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  primario: { backgroundColor: colors.primaria },
  secundario: { backgroundColor: colors.fundo },
  off: { opacity: 0.5 },
  textoPrimario: { color: '#fff', fontWeight: '700' },
  textoSecundario: { color: colors.texto, fontWeight: '700' },
});
