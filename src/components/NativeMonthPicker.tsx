import { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { formatDate } from '../utils/format'

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const colors = { ink: '#252724', muted: '#73766f', paper: '#fffefa', line: '#d8d5ce', brand: '#173c3a', accent: '#c66243' }

interface NativeMonthPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  allowPresent?: boolean
  present?: boolean
  onPresentChange?: (present: boolean) => void
}

export function NativeMonthPicker({ label, value, onChange, allowPresent = false, present = false, onPresentChange }: NativeMonthPickerProps) {
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const minimumYear = 1940
  const maximumYear = new Date().getFullYear() + 20

  const openPicker = () => {
    const selectedYear = Number(value.slice(0, 4))
    setYear(selectedYear >= minimumYear && selectedYear <= maximumYear ? selectedYear : new Date().getFullYear())
    setOpen(true)
  }

  const selectMonth = (monthIndex: number) => {
    onPresentChange?.(false)
    onChange(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)
    setOpen(false)
  }

  const selectPresent = () => {
    onChange('')
    onPresentChange?.(true)
    setOpen(false)
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${present ? 'Presente' : formatDate(value) || 'Seleccionar'}`} onPress={openPicker} style={styles.trigger}>
        <Text style={[styles.triggerText, (value || present) && styles.triggerSelected]}>{present ? 'Presente' : formatDate(value) || 'Seleccionar'}</Text>
        <Ionicons name="calendar-outline" size={17} color={colors.muted} />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Cerrar calendario" />
          <View accessibilityViewIsModal style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <View><Text style={styles.eyebrow}>CALENDARIO</Text><Text style={styles.dialogTitle}>{label}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar calendario" onPress={() => setOpen(false)} style={styles.closeButton}>
                <Ionicons name="close" size={21} color={colors.ink} />
              </Pressable>
            </View>

            {allowPresent && (
              <Pressable accessibilityRole="button" accessibilityState={{ selected: present }} onPress={selectPresent} style={[styles.presentOption, present && styles.presentOptionActive]}>
                <View><Text style={styles.presentTitle}>Presente</Text><Text style={styles.presentSubtitle}>Trabajo actual</Text></View>
                {present && <Ionicons name="checkmark" size={18} color={colors.brand} />}
              </Pressable>
            )}

            <View style={styles.yearControl}>
              <Pressable accessibilityRole="button" accessibilityLabel="Año anterior" disabled={year <= minimumYear} onPress={() => setYear((current) => Math.max(minimumYear, current - 1))} style={styles.yearButton}>
                <Ionicons name="chevron-back" size={19} color={colors.brand} />
              </Pressable>
              <View style={styles.yearValue}><Text style={styles.yearCaption}>AÑO</Text><Text style={styles.yearText}>{year}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Año siguiente" disabled={year >= maximumYear} onPress={() => setYear((current) => Math.min(maximumYear, current + 1))} style={styles.yearButton}>
                <Ionicons name="chevron-forward" size={19} color={colors.brand} />
              </Pressable>
            </View>

            <View style={styles.monthGrid}>
              {months.map((month, index) => {
                const selected = !present && value === `${year}-${String(index + 1).padStart(2, '0')}`
                return (
                  <Pressable key={month} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => selectMonth(index)} style={[styles.monthButton, selected && styles.monthButtonSelected]}>
                    <Text style={[styles.monthText, selected && styles.monthTextSelected]}>{month.slice(0, 3)}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  field: { flex: 1, marginBottom: 11, minWidth: 0 },
  label: { color: '#535650', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  trigger: { alignItems: 'center', backgroundColor: '#f8f7f3', borderColor: '#d7d5cf', borderWidth: 1, flexDirection: 'row', height: 42, justifyContent: 'space-between', paddingHorizontal: 11 },
  triggerText: { color: '#7f817c', fontSize: 13 },
  triggerSelected: { color: colors.ink },
  overlay: { alignItems: 'center', backgroundColor: 'rgba(25, 31, 29, .44)', flex: 1, justifyContent: 'center', padding: 20 },
  dialog: { backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1, maxWidth: 420, padding: 20, width: '100%' },
  dialogHeader: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 14 },
  eyebrow: { color: colors.accent, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  dialogTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 3 },
  closeButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 },
  presentOption: { alignItems: 'center', backgroundColor: '#f0f3ef', borderColor: 'transparent', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingHorizontal: 12, paddingVertical: 10 },
  presentOptionActive: { borderColor: '#78918b' },
  presentTitle: { color: colors.brand, fontSize: 13, fontWeight: '700' },
  presentSubtitle: { color: colors.muted, fontSize: 10, marginTop: 2 },
  yearControl: { alignItems: 'center', backgroundColor: '#f7f5f0', flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, minHeight: 64 },
  yearButton: { alignItems: 'center', height: 56, justifyContent: 'center', width: 48 },
  yearValue: { alignItems: 'center', justifyContent: 'center' },
  yearCaption: { color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  yearText: { color: colors.brand, fontSize: 23, fontWeight: '700', marginTop: 2 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'space-between', marginTop: 12 },
  monthButton: { alignItems: 'center', borderColor: 'transparent', borderWidth: 1, flexBasis: '31%', height: 40, justifyContent: 'center' },
  monthButtonSelected: { backgroundColor: colors.brand },
  monthText: { color: colors.ink, fontSize: 12 },
  monthTextSelected: { color: 'white', fontWeight: '700' },
})