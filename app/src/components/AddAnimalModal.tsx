import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  visivel: boolean;
  onCancelar: () => void;
  onConfirmar: (pesoKg: number) => void;
}

export function AddAnimalModal({ visivel, onCancelar, onConfirmar }: Props) {
  const [texto, setTexto] = useState('');
  const peso = Number(texto.replace(',', '.'));
  const valido = Number.isFinite(peso) && peso > 0 && peso <= 1000;

  const confirmar = () => {
    if (!valido) return;
    onConfirmar(peso);
    setTexto('');
  };

  const cancelar = () => {
    setTexto('');
    onCancelar();
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={cancelar}>
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>Adicionar animal</Text>
          <Text style={styles.ajuda}>
            Informe o peso estimado. O tempo de compostagem é calculado pelo maior animal da leira.
          </Text>
          <TextInput
            style={styles.input}
            value={texto}
            onChangeText={setTexto}
            placeholder="Ex.: 120"
            placeholderTextColor={colors.textoSuave}
            keyboardType="decimal-pad"
            autoFocus
          />
          <Text style={styles.unidade}>quilogramas (kg)</Text>
          <View style={styles.botoes}>
            <Pressable style={[styles.botao, styles.secundario]} onPress={cancelar}>
              <Text style={styles.textoSecundario}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.botao, styles.primario, !valido && styles.desabilitado]}
              onPress={confirmar}
              disabled={!valido}
            >
              <Text style={styles.textoPrimario}>Adicionar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: '#000A', justifyContent: 'center', padding: 24 },
  caixa: { backgroundColor: colors.superficie, borderRadius: 24, padding: 24 },
  titulo: { fontSize: 20, fontWeight: '800', color: colors.texto },
  ajuda: { fontSize: 13, color: colors.textoSuave, marginTop: 6, marginBottom: 18, lineHeight: 18 },
  input: {
    backgroundColor: colors.fundo,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '700',
    color: colors.texto,
  },
  unidade: { fontSize: 12, color: colors.textoSuave, marginTop: 6 },
  botoes: { flexDirection: 'row', gap: 12, marginTop: 22 },
  botao: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  primario: { backgroundColor: colors.primaria },
  secundario: { backgroundColor: colors.fundo },
  desabilitado: { opacity: 0.4 },
  textoPrimario: { color: '#fff', fontWeight: '700' },
  textoSecundario: { color: colors.texto, fontWeight: '700' },
});
