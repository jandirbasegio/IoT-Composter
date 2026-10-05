import type { ReactElement } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';
import type { Leitura } from '../types';
import { formatarDataHora, statusGas, statusTemperatura } from '../utils/status';

interface Props {
  leituras: Leitura[];
  refreshing: boolean;
  onRefresh: () => void;
  header?: ReactElement;
}

export function HistoryList({ leituras, refreshing, onRefresh, header }: Props) {
  return (
    <FlatList
      data={leituras}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primaria} colors={[colors.primaria]} />
      }
      ListHeaderComponent={
        <View>
          {header}
          <Text style={styles.secao}>Histórico de leituras</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vazio}>Nenhuma leitura anterior.</Text>}
      renderItem={({ item }) => {
        const temp = statusTemperatura(item.temperaturaComposteira);
        const gas = statusGas(item.gasAmoniaRaw);
        return (
          <View style={styles.linha}>
            <View style={[styles.ponto, { backgroundColor: temp.cor }]} />
            <View style={styles.corpo}>
              <Text style={styles.data}>{formatarDataHora(item.dataHora)}</Text>
              <Text style={styles.detalhe}>
                Ambiente {item.temperaturaAmbiente.toFixed(1)}° · {item.umidadeAmbiente.toFixed(0)}% umid.
              </Text>
            </View>
            <View style={styles.valores}>
              <Text style={[styles.principal, { color: temp.cor }]}>
                {item.temperaturaComposteira.toFixed(1)}°C
              </Text>
              <Text style={[styles.gas, { color: gas.cor }]}>NH₃ {item.gasAmoniaRaw}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  secao: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.texto,
    marginTop: 28,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  vazio: { textAlign: 'center', color: colors.textoSuave, marginTop: 8 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.superficie,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    ...shadow,
    elevation: 1,
  },
  ponto: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  corpo: { flex: 1 },
  data: { fontSize: 14, fontWeight: '700', color: colors.texto },
  detalhe: { fontSize: 12, color: colors.textoSuave, marginTop: 2 },
  valores: { alignItems: 'flex-end' },
  principal: { fontSize: 16, fontWeight: '800' },
  gas: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});
