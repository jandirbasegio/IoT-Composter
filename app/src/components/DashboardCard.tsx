import { StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';

interface Props {
  titulo: string;
  valor: string;
  unidade?: string;
  icone: string;
  cor: string;
  /** Selo de status exibido no canto (ex.: "Crítica"). */
  selo?: string;
}

export function DashboardCard({ titulo, valor, unidade, icone, cor, selo }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.faixa, { backgroundColor: cor }]} />
      <View style={styles.topo}>
        <View style={[styles.icone, { backgroundColor: cor + '1F' }]}>
          <Text style={styles.emoji}>{icone}</Text>
        </View>
        {selo ? (
          <View style={[styles.selo, { backgroundColor: cor + '1F' }]}>
            <Text style={[styles.seloTexto, { color: cor }]}>{selo}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.valor}>
        {valor}
        {unidade ? <Text style={styles.unidade}> {unidade}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.superficie,
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    ...shadow,
  },
  faixa: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icone: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20 },
  selo: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  seloTexto: { fontSize: 11, fontWeight: '700' },
  titulo: { fontSize: 13, color: colors.textoSuave, marginTop: 14 },
  valor: { fontSize: 28, fontWeight: '800', color: colors.texto, marginTop: 2 },
  unidade: { fontSize: 14, fontWeight: '500', color: colors.textoSuave },
});
