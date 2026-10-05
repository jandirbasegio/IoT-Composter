import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AddAnimalModal } from '../components/AddAnimalModal';
import { CicloPanel } from '../components/CicloPanel';
import { DashboardCard } from '../components/DashboardCard';
import { HistoryList } from '../components/HistoryList';
import { useCiclo } from '../hooks/useCiclo';
import { useLeituras } from '../hooks/useLeituras';
import { colors } from '../theme';
import { formatarDataHora, statusGas, statusTemperatura } from '../utils/status';

export function DashboardScreen() {
  const { leituras, loading, refreshing, erro, atualizar } = useLeituras();
  const ciclo = useCiclo();
  const [modalAnimal, setModalAnimal] = useState(false);
  const [ultima, ...anteriores] = leituras;

  const atualizarTudo = async () => {
    await Promise.all([atualizar(), ciclo.recarregar()]);
  };

  const confirmarFechamento = () =>
    Alert.alert(
      'Fechar célula?',
      'Depois de fechada, não será possível adicionar animais e a contagem dos dias começa.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fechar célula', onPress: () => void ciclo.fechar() },
      ],
    );

  const confirmarMaturacao = () =>
    Alert.alert('Iniciar maturação?', 'O ciclo atual será encerrado e os alertas serão desativados.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Iniciar', onPress: () => void ciclo.maturar() },
    ]);

  if (loading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colors.primaria} />
      </View>
    );
  }

  const statusTemp = ultima ? statusTemperatura(ultima.temperaturaComposteira) : null;
  const statusAmonia = ultima ? statusGas(ultima.gasAmoniaRaw) : null;

  const header = (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitulo}>Composteira IoT</Text>
        <Text style={styles.heroSub}>
          {ultima ? `Atualizado em ${formatarDataHora(ultima.dataHora)}` : 'Aguardando leituras do sensor'}
        </Text>
      </View>

      <View style={styles.conteudo}>
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <CicloPanel
          ciclo={ciclo.ciclo}
          ocupado={ciclo.ocupado}
          onIniciar={() => void ciclo.iniciar()}
          onAdicionarAnimal={() => setModalAnimal(true)}
          onFechar={confirmarFechamento}
          onMaturar={confirmarMaturacao}
        />

        {ultima && statusTemp && statusAmonia ? (
          <View style={styles.grade}>
            <DashboardCard
              titulo="Temp. composteira"
              valor={ultima.temperaturaComposteira.toFixed(1)}
              unidade="°C"
              icone="🔥"
              cor={statusTemp.cor}
              selo={statusTemp.nivel === 'NORMAL' ? undefined : statusTemp.rotulo}
            />
            <DashboardCard
              titulo="Amônia (raw)"
              valor={String(ultima.gasAmoniaRaw)}
              icone="☁️"
              cor={statusAmonia.cor}
              selo={statusAmonia.nivel === 'NORMAL' ? undefined : statusAmonia.rotulo}
            />
            <DashboardCard
              titulo="Temp. ambiente"
              valor={ultima.temperaturaAmbiente.toFixed(1)}
              unidade="°C"
              icone="🌡️"
              cor="#EF8A00"
            />
            <DashboardCard
              titulo="Umidade"
              valor={ultima.umidadeAmbiente.toFixed(1)}
              unidade="%"
              icone="💧"
              cor="#1976D2"
            />
          </View>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.tela}>
      <SafeAreaView style={styles.tela}>
        <HistoryList leituras={anteriores} refreshing={refreshing} onRefresh={atualizarTudo} header={header} />
      </SafeAreaView>

      <AddAnimalModal
        visivel={modalAnimal}
        onCancelar={() => setModalAnimal(false)}
        onConfirmar={(peso) => {
          setModalAnimal(false);
          void ciclo.adicionar(peso);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.fundo },
  hero: {
    backgroundColor: colors.primariaEscura,
    paddingHorizontal: 20,
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0) + 24,
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroTitulo: { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, color: '#C8E6C9', marginTop: 4 },
  conteudo: { paddingHorizontal: 16, marginTop: -36, gap: 14 },
  erro: { backgroundColor: '#FDECEA', color: '#B71C1C', padding: 12, borderRadius: 14 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
