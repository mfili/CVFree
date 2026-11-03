import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeMonthPicker } from "./components/NativeMonthPicker";
import { emptyItems, initialResume } from "./data/initialResume";
import { getTemplate, templates } from "./data/templates";
import type { CollectionKey, ResumeData } from "./types";
import { dateRange } from "./utils/format";
import { exportNativeDocx } from "./utils/exportDocxNative";
import { buildNativeResumeHtml } from "./utils/exportPdfNative";

const STORAGE_KEY = "cvfreeli-resume";
const colors = {
  ink: "#252724",
  muted: "#73766f",
  paper: "#fffefa",
  canvas: "#e9e6df",
  line: "#d8d5ce",
  brand: "#173c3a",
  accent: "#c66243",
  danger: "#a64732",
};
type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  onPresentChange?: (present: boolean) => void;
};
function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  onPresentChange,
}: FieldProps) {
  if (label === "Inicio (AAAA-MM)" || label === "Fin (AAAA-MM)") {
    const allowPresent = label.startsWith("Fin");
    const present = allowPresent && value === "Presente";
    return (
      <NativeMonthPicker
        label={allowPresent ? "Fecha de finalización" : "Fecha de inicio"}
        value={present ? "" : value}
        onChange={onChange}
        allowPresent={allowPresent}
        present={present}
        onPresentChange={allowPresent ? onPresentChange : undefined}
      />
    );
  }
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#a7a8a3"
        multiline={multiline}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}
function Section({
  title,
  subtitle,
  children,
  openByDefault = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  openByDefault?: boolean;
}) {
  const [open, setOpen] = useState(openByDefault);
  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((current) => !current)}
        style={styles.sectionHeader}
      >
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={19}
          color={colors.muted}
        />
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}
function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.addButton}>
      <Ionicons name="add" size={18} color={colors.brand} />
      <Text style={styles.addText}>{label}</Text>
    </Pressable>
  );
}
function EntryHeader({
  label,
  index,
  onRemove,
  canRemove = true,
}: {
  label: string;
  index: number;
  onRemove: () => void;
  canRemove?: boolean;
}) {
  return (
    <View style={styles.itemHeader}>
      <Text style={styles.itemLabel}>
        {label.toUpperCase()} {index + 1}
      </Text>
      {canRemove && (
        <Pressable onPress={onRemove} accessibilityLabel={`Eliminar ${label}`}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      )}
    </View>
  );
}

function Preview({ data }: { data: ResumeData }) {
  const template = getTemplate(data.template);
  const darkHeader =
    template.layout === "top-band" || data.template === "norte" || data.template === "plantilla-11";
  const centeredHeader =
    template.layout === "centered" || data.template === "clasica";
  const fullName =
    `${data.personal.firstName} ${data.personal.lastName}`.trim() ||
    "Tu nombre";
  const experiences = data.experiences.filter(
    (item) => item.role || item.company || item.description,
  );
  const education = data.education.filter(
    (item) => item.institution || item.degree,
  );
  const courses = data.courses.filter((item) => item.name || item.issuer);
  const languages = data.languages.filter((item) => item.name || item.level);
  return (
    <View
      style={[
        styles.resume,
        { borderTopColor: template.accent },
        data.template === "norte" && styles.resumeNorth,
        data.template === "clasica" && styles.resumeClassic,
        template.layout === "rail" && { borderLeftColor: template.accent, borderLeftWidth: 7 },
        template.layout === "split" && { borderLeftColor: template.accent, borderLeftWidth: 9 },
        template.layout === "compact" && { padding: 21 },
      ]}
    >
      <View
        style={[
          styles.resumeHeader,
          { borderBottomColor: template.accent },
          data.template === "norte" && styles.resumeNorthHeader,
          data.template === "clasica" && styles.resumeClassicHeader,
          darkHeader && data.template !== "norte" && {
            backgroundColor: template.ink,
            borderBottomColor: template.accent,
            borderBottomWidth: 7,
            marginHorizontal: -27,
            marginTop: -15,
            paddingHorizontal: 27,
            paddingTop: 22,
          },
          centeredHeader && data.template !== "clasica" && {
            flexDirection: "column",
            marginBottom: 15,
            paddingBottom: 20,
          },
        ]}
      >
        {data.personal.photo && (
          <Image
            source={{ uri: data.personal.photo }}
            style={[
              styles.resumePhoto,
              data.template === "norte" && styles.resumeNorthPhoto,
              data.template === "clasica" && styles.resumeClassicPhoto,
              darkHeader && { borderColor: "white", borderRadius: 3, borderWidth: 3 },
            ]}
          />
        )}
        <View
          style={[
            styles.resumeIdentity,
            data.template === "clasica" && styles.resumeClassicIdentity,
            centeredHeader && { alignItems: "center", width: "100%" },
          ]}
        >
          <Text
            style={[
              styles.resumeKicker,
              { color: darkHeader ? "#e6b6a6" : template.accent },
              data.template === "norte" && styles.resumeNorthKicker,
              data.template === "clasica" && styles.resumeClassicKicker,
            ]}
          >
            CURRÍCULUM PROFESIONAL
          </Text>
          <Text
            style={[
              styles.resumeName,
              { color: darkHeader ? "white" : template.ink },
              data.template === "norte" && styles.resumeNorthName,
              data.template === "clasica" && styles.resumeClassicName,
            ]}
          >
            {fullName}
          </Text>
          <View
            style={[
              styles.resumeContact,
              data.template === "clasica" && styles.resumeClassicContact,
              centeredHeader && { justifyContent: "center" },
            ]}
          >
            {[
              {
                key: "email",
                icon: "mail-outline" as const,
                value: data.personal.email,
              },
              {
                key: "phone",
                icon: "call-outline" as const,
                value: data.personal.phone,
              },
              {
                key: "address",
                icon: "home-outline" as const,
                value: [data.personal.city, data.personal.country]
                  .filter(Boolean)
                  .join(", "),
              },
              {
                key: "linkedin",
                icon: "logo-linkedin" as const,
                value: data.personal.linkedin.replace(
                  /^https?:\/\/(www\.)?/,
                  "",
                ),
              },
            ]
              .filter(({ value }) => value)
              .map(({ key, icon, value }) => (
                <View key={key} style={styles.resumeContactItem}>
                  <Ionicons
                    name={icon}
                    size={12}
                    color={darkHeader ? "#e1e9e5" : "#646761"}
                  />
                  <Text
                    style={[
                      styles.resumeContactText,
                      darkHeader && { color: "#e1e9e5" },
                      data.template === "norte" && styles.resumeNorthContact,
                    ]}
                  >
                    {value}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </View>
      <View>
        {data.personal.profile && (
          <ResumeBlock title="Perfil" accentColor={template.accent}>
            <Text style={styles.resumeText}>{data.personal.profile}</Text>
          </ResumeBlock>
        )}
        {experiences.length > 0 && (
          <ResumeBlock title="Experiencia" accentColor={template.accent}>
            {experiences.map((item) => (
              <View key={item.id} style={styles.resumeEntry}>
                <Text style={[styles.entryRole, { color: template.ink }]}>
                  {item.role || "Nombre del puesto"}
                </Text>
                <Text style={styles.entryCompany}>{item.company}</Text>
                <Text style={styles.entryDate}>
                  {dateRange(item.startDate, item.endDate, item.current)}
                </Text>
                {item.description && (
                  <Text style={styles.resumeText}>{item.description}</Text>
                )}
              </View>
            ))}
          </ResumeBlock>
        )}
        {education.length > 0 && (
          <ResumeBlock title="Educación" accentColor={template.accent}>
            {education.map((item) => (
              <View key={item.id} style={styles.resumeEntry}>
                <Text style={[styles.entryRole, { color: template.ink }]}>{item.degree || "Grado"}</Text>
                <Text style={styles.entryCompany}>{item.institution}</Text>
                <Text style={styles.entryDate}>
                  {dateRange(item.startDate, item.endDate)}
                </Text>
              </View>
            ))}
          </ResumeBlock>
        )}
        <View style={styles.resumeColumns}>
          {courses.length > 0 && (
            <View style={styles.column}>
              <Text style={[styles.resumeSectionTitle, { color: template.accent }]}>Cursos</Text>
              {courses.map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <Text style={[styles.entryRole, { color: template.ink }]}>{item.name}</Text>
                  <Text style={styles.entryCompany}>{item.issuer}</Text>
                </View>
              ))}
            </View>
          )}
          {languages.length > 0 && (
            <View style={styles.column}>
              <Text style={[styles.resumeSectionTitle, { color: template.accent }]}>Idiomas</Text>
              {languages.map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <Text style={[styles.entryRole, { color: template.ink }]}>{item.name}</Text>
                  <Text style={styles.entryCompany}>{item.level}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {data.customSections
          .filter((item) => item.description)
          .map((item) => (
            <ResumeBlock
              key={item.id}
              title={item.title || "Información adicional"}
              accentColor={template.accent}
            >
              <Text style={styles.resumeText}>{item.description}</Text>
            </ResumeBlock>
          ))}
      </View>
    </View>
  );
}
function ResumeBlock({
  title,
  accentColor,
  children,
}: {
  title: string;
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.resumeBlock}>
      <Text style={[styles.resumeSectionTitle, { color: accentColor }]}>{title}</Text>
      <View style={styles.resumeBlockContent}>{children}</View>
    </View>
  );
}
export default function App() {
  const [data, setData] = useState<ResumeData>(initialResume);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) {
          const storedData = JSON.parse(value) as ResumeData;
          setData({
            ...initialResume,
            ...storedData,
            personal: { ...initialResume.personal, ...storedData.personal },
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (loading) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSaved(true);
    const timeout = setTimeout(() => setSaved(false), 1400);
    return () => clearTimeout(timeout);
  }, [data, loading]);
  const updatePersonal = (field: keyof ResumeData["personal"], value: string) =>
    setData((current) => ({
      ...current,
      personal: { ...current.personal, [field]: value },
    }));
  const updateItem = <K extends CollectionKey>(
    collection: K,
    id: string,
    changes: Partial<ResumeData[K][number]>,
  ) =>
    setData((current) => ({
      ...current,
      [collection]: current[collection].map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...changes };
        if (
          collection === "experiences" &&
          "current" in item &&
          "current" in changes
        ) {
          if (changes.current)
            return { ...updated, endDate: "Presente" } as ResumeData[K][number];
          if (item.current)
            return { ...updated, endDate: "" } as ResumeData[K][number];
        }
        return updated;
      }),
    }));
  const addItem = (collection: CollectionKey) =>
    setData((current) => ({
      ...current,
      [collection]: [...current[collection], emptyItems[collection]()],
    }));
  const removeItem = (collection: CollectionKey, id: string) =>
    setData((current) => ({
      ...current,
      [collection]: current[collection].filter((item) => item.id !== id),
    }));
  const selectPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) updatePersonal("photo", result.assets[0].uri);
  };
  const exportPdf = async () => {
    setExporting(true);
    try {
      let photoDataUri: string | undefined;
      if (data.personal.photo.startsWith("data:image/")) {
        photoDataUri = data.personal.photo;
      } else if (data.personal.photo) {
        const extension = data.personal.photo.split(/[?#]/)[0].toLowerCase();
        const mimeType = extension.endsWith(".png")
          ? "image/png"
          : extension.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg";
        const photoBase64 = await FileSystem.readAsStringAsync(
          data.personal.photo,
          { encoding: FileSystem.EncodingType.Base64 },
        );
        photoDataUri = `data:${mimeType};base64,${photoBase64}`;
      }
      const result = await Print.printToFileAsync({
        html: buildNativeResumeHtml(data, photoDataUri),
      });
      if (await Sharing.isAvailableAsync())
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Compartir currículum",
        });
    } finally {
      setExporting(false);
    }
  };
  const exportDocx = async () => {
    setExporting(true);
    try {
      await exportNativeDocx(data);
    } finally {
      setExporting(false);
    }
  };
  if (loading)
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={colors.brand} />
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.safe}
      >
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="document-text" color="white" size={18} />
            </View>
            <Text style={styles.brandText}>CVFree</Text>
          </View>
          {saved && <Text style={styles.saved}>Guardado</Text>}
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>CONTENIDO</Text>
            <Text style={styles.heading}>Construye tu historia</Text>
            <Text style={styles.muted}>
              Completa solo lo que necesites. Los campos vacíos no aparecerán en
              tu CV.
            </Text>
          </View>
          <Section
            title="Datos personales"
            subtitle="Identidad y contacto"
            openByDefault
          >
            <Pressable
              onPress={() => void selectPhoto()}
              style={styles.photoButton}
            >
              {data.personal.photo ? (
                <Image
                  source={{ uri: data.personal.photo }}
                  style={styles.photo}
                />
              ) : (
                <Ionicons
                  name="camera-outline"
                  size={25}
                  color={colors.muted}
                />
              )}
              <Text style={styles.photoLabel}>
                {data.personal.photo ? "Cambiar foto" : "Agregar foto"}
              </Text>
            </Pressable>
            <View style={styles.grid}>
              <Field
                label="Nombres"
                value={data.personal.firstName}
                onChange={(value) => updatePersonal("firstName", value)}
                placeholder="Valentina"
              />
              <Field
                label="Apellidos"
                value={data.personal.lastName}
                onChange={(value) => updatePersonal("lastName", value)}
                placeholder="Herrera"
              />
              <Field
                label="Correo electrónico"
                value={data.personal.email}
                onChange={(value) => updatePersonal("email", value)}
                placeholder="nombre@correo.com"
              />
              <Field
                label="Teléfono"
                value={data.personal.phone}
                onChange={(value) => updatePersonal("phone", value)}
                placeholder="+57 300 123 4567"
              />
              <Field
                label="Ciudad"
                value={data.personal.city}
                onChange={(value) => updatePersonal("city", value)}
                placeholder="Bogotá"
              />
              <Field
                label="País"
                value={data.personal.country}
                onChange={(value) => updatePersonal("country", value)}
                placeholder="Colombia"
              />
              <Field
                label="LinkedIn"
                value={data.personal.linkedin}
                onChange={(value) => updatePersonal("linkedin", value)}
                placeholder="linkedin.com/in/usuario"
              />
            </View>
          </Section>
          <Section title="Perfil profesional" subtitle="Tu propuesta de valor">
            <Field
              label="Descripción"
              value={data.personal.profile}
              onChange={(value) => updatePersonal("profile", value)}
              placeholder="Resume tu experiencia y fortalezas."
              multiline
            />
          </Section>
          <Section
            title="Experiencia laboral"
            subtitle={`${data.experiences.length} puesto${data.experiences.length === 1 ? "" : "s"}`}
          >
            {data.experiences.map((item, index) => (
              <View key={item.id} style={styles.repeatable}>
                <EntryHeader
                  index={index}
                  label="Experiencia"
                  canRemove={data.experiences.length > 1}
                  onRemove={() => removeItem("experiences", item.id)}
                />
                <Field
                  label="Nombre del puesto"
                  value={item.role}
                  onChange={(value) =>
                    updateItem("experiences", item.id, { role: value })
                  }
                  placeholder="Diseñadora de producto"
                />
                <Field
                  label="Compañía"
                  value={item.company}
                  onChange={(value) =>
                    updateItem("experiences", item.id, { company: value })
                  }
                  placeholder="Nombre de la empresa"
                />
                <Field
                  label="Inicio (AAAA-MM)"
                  value={item.startDate}
                  onChange={(value) =>
                    updateItem("experiences", item.id, { startDate: value })
                  }
                  placeholder="2022-01"
                />
                <Field
                  label="Fin (AAAA-MM)"
                  value={item.endDate}
                  onChange={(value) =>
                    updateItem("experiences", item.id, { endDate: value })
                  }
                  placeholder="2024-06"
                  onPresentChange={(current) =>
                    updateItem("experiences", item.id, { current })
                  }
                />
                <View style={styles.switchRow}>
                  <Text style={styles.fieldLabel}>Puesto actual</Text>
                  <Switch
                    value={item.current}
                    onValueChange={(value) =>
                      updateItem("experiences", item.id, {
                        current: value,
                      })
                    }
                    trackColor={{ true: colors.brand }}
                  />
                </View>
                <Field
                  label="Descripción"
                  value={item.description}
                  onChange={(value) =>
                    updateItem("experiences", item.id, { description: value })
                  }
                  placeholder="Responsabilidades, logros e impacto."
                  multiline
                />
              </View>
            ))}
            <AddButton
              label="Agregar experiencia"
              onPress={() => addItem("experiences")}
            />
          </Section>
          <Section
            title="Educación"
            subtitle={`${data.education.length} registro${data.education.length === 1 ? "" : "s"}`}
          >
            {data.education.map((item, index) => (
              <View key={item.id} style={styles.repeatable}>
                <EntryHeader
                  index={index}
                  label="Formación"
                  onRemove={() => removeItem("education", item.id)}
                />
                <Field
                  label="Institución"
                  value={item.institution}
                  onChange={(value) =>
                    updateItem("education", item.id, { institution: value })
                  }
                  placeholder="Universidad o institución"
                />
                <Field
                  label="Grado"
                  value={item.degree}
                  onChange={(value) =>
                    updateItem("education", item.id, { degree: value })
                  }
                  placeholder="Título obtenido"
                />
                <Field
                  label="Inicio (AAAA-MM)"
                  value={item.startDate}
                  onChange={(value) =>
                    updateItem("education", item.id, { startDate: value })
                  }
                  placeholder="2018-01"
                />
                <Field
                  label="Fin (AAAA-MM)"
                  value={item.endDate}
                  onChange={(value) =>
                    updateItem("education", item.id, { endDate: value })
                  }
                  placeholder="2022-06"
                />
              </View>
            ))}
            <AddButton
              label="Agregar educación"
              onPress={() => addItem("education")}
            />
          </Section>
          <Section
            title="Cursos e idiomas"
            subtitle="Certificaciones y niveles"
          >
            <Text style={styles.subsection}>Cursos</Text>
            {data.courses.map((item, index) => (
              <View key={item.id} style={styles.repeatable}>
                <EntryHeader
                  index={index}
                  label="Curso"
                  onRemove={() => removeItem("courses", item.id)}
                />
                <Field
                  label="Nombre"
                  value={item.name}
                  onChange={(value) =>
                    updateItem("courses", item.id, { name: value })
                  }
                  placeholder="Nombre del curso"
                />
                <Field
                  label="Expedido por"
                  value={item.issuer}
                  onChange={(value) =>
                    updateItem("courses", item.id, { issuer: value })
                  }
                  placeholder="Institución emisora"
                />
              </View>
            ))}
            <AddButton
              label="Agregar curso"
              onPress={() => addItem("courses")}
            />
            <Text style={styles.subsection}>Idiomas</Text>
            {data.languages.map((item, index) => (
              <View key={item.id} style={styles.repeatable}>
                <EntryHeader
                  index={index}
                  label="Idioma"
                  onRemove={() => removeItem("languages", item.id)}
                />
                <Field
                  label="Idioma"
                  value={item.name}
                  onChange={(value) =>
                    updateItem("languages", item.id, { name: value })
                  }
                  placeholder="Inglés"
                />
                <Field
                  label="Nivel"
                  value={item.level}
                  onChange={(value) =>
                    updateItem("languages", item.id, { level: value })
                  }
                  placeholder="Avanzado"
                />
              </View>
            ))}
            <AddButton
              label="Agregar idioma"
              onPress={() => addItem("languages")}
            />
          </Section>
          <Section
            title="Otras secciones"
            subtitle="Habilidades e información adicional"
          >
            {data.customSections.map((item, index) => (
              <View key={item.id} style={styles.repeatable}>
                <EntryHeader
                  index={index}
                  label="Sección"
                  onRemove={() => removeItem("customSections", item.id)}
                />
                <Field
                  label="Título"
                  value={item.title}
                  onChange={(value) =>
                    updateItem("customSections", item.id, { title: value })
                  }
                  placeholder="Habilidades"
                />
                <Field
                  label="Descripción"
                  value={item.description}
                  onChange={(value) =>
                    updateItem("customSections", item.id, {
                      description: value,
                    })
                  }
                  placeholder="Describe habilidades u otra información relevante."
                  multiline
                />
              </View>
            ))}
            <AddButton
              label="Agregar sección"
              onPress={() => addItem("customSections")}
            />
          </Section>
          <Text style={styles.previewHeading}>Vista previa</Text>
          <View style={styles.templateRow}>
            {templates.map((template) => (
              <Pressable
                key={template.id}
                onPress={() =>
                  setData((current) => ({ ...current, template: template.id }))
                }
                style={[
                  styles.templateButton,
                  data.template === template.id && styles.templateButtonActive,
                ]}
              >
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>
                  {template.description}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.previewActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Descargar DOCX"
              onPress={() => void exportDocx()}
              style={styles.exportButton}
              disabled={exporting}
            >
              <Ionicons name="document-outline" size={17} color="white" />
              <Text style={styles.exportText}>Descargar DOCX</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Descargar PDF"
              onPress={() => void exportPdf()}
              style={styles.exportButton}
              disabled={exporting}
            >
              <Ionicons
                name={exporting ? "hourglass-outline" : "download-outline"}
                size={17}
                color="white"
              />
              <Text style={styles.exportText}>
                {exporting ? "Generando" : "Descargar PDF"}
              </Text>
            </Pressable>
          </View>
          <Preview data={data} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  loading: {
    alignItems: "center",
    backgroundColor: colors.canvas,
    flex: 1,
    justifyContent: "center",
  },
  topbar: {
    alignItems: "center",
    backgroundColor: colors.paper,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brand: { alignItems: "center", flexDirection: "row", gap: 9 },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.brand,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  brandText: { color: colors.ink, fontSize: 23, fontWeight: "700" },
  saved: { color: "#457064", fontSize: 12 },
  exportButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    flexDirection: "row",
    flex: 1,
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  exportText: { color: "white", fontSize: 12, fontWeight: "700" },
  content: { padding: 18, paddingBottom: 55 },
  intro: { marginBottom: 18 },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  heading: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "700",
    marginVertical: 6,
  },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  section: { borderTopColor: colors.line, borderTopWidth: 1 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 17,
  },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  sectionBody: { paddingBottom: 20 },
  grid: { gap: 12 },
  field: { marginBottom: 11 },
  fieldLabel: {
    color: "#535650",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8f7f3",
    borderColor: "#d7d5cf",
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    minHeight: 42,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  textarea: { minHeight: 95, textAlignVertical: "top" },
  photoButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#f1eee8",
    borderColor: "#aaa9a3",
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    padding: 8,
  },
  photo: { height: 48, width: 48 },
  photoLabel: { color: colors.ink, fontSize: 12 },
  repeatable: {
    borderLeftColor: "#d9dfda",
    borderLeftWidth: 2,
    marginBottom: 20,
    paddingLeft: 13,
  },
  itemHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemLabel: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  addButton: {
    alignItems: "center",
    borderColor: "#a9ada6",
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    padding: 11,
  },
  addText: { color: colors.brand, fontSize: 12, fontWeight: "700" },
  subsection: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 4,
  },
  previewHeading: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 25,
  },
  templateRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 16 },
  previewActions: { flexDirection: "row", gap: 8, marginBottom: 16 },
  templateButton: {
    backgroundColor: "#f3f0ea",
    borderColor: "transparent",
    borderWidth: 1,
    flexBasis: "47%",
    minHeight: 58,
    minWidth: 130,
    padding: 8,
  },
  templateButtonActive: {
    backgroundColor: colors.paper,
    borderColor: "#c9c7c0",
  },
  templateName: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  templateDescription: { color: colors.muted, fontSize: 9, marginTop: 3 },
  resume: {
    backgroundColor: "white",
    minHeight: 460,
    padding: 27,
    shadowColor: "#2e2b24",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  resumeNorth: { borderTopColor: colors.brand, borderTopWidth: 12 },
  resumeClassic: { borderTopColor: "#51534f", borderTopWidth: 3 },
  resumeNorthHeader: {
    backgroundColor: colors.brand,
    borderBottomColor: colors.accent,
    borderBottomWidth: 7,
    marginHorizontal: -27,
    marginTop: -15,
    paddingHorizontal: 27,
    paddingTop: 22,
  },
  resumeNorthPhoto: { borderColor: "white", borderRadius: 3, borderWidth: 3 },
  resumeNorthKicker: { color: "#e6b6a6" },
  resumeNorthName: { color: "white", fontSize: 25 },
  resumeNorthContact: { color: "#e1e9e5" },
  resumeClassicHeader: {
    borderBottomColor: "#51534f",
    borderBottomWidth: 3,
    flexDirection: "column",
    marginBottom: 15,
    paddingBottom: 20,
  },
  resumeClassicPhoto: { borderColor: "#777", borderRadius: 2, borderWidth: 1 },
  resumeClassicIdentity: { alignItems: "center", width: "100%" },
  resumeClassicKicker: { color: "#555" },
  resumeClassicName: {
    color: "#2d2e2b",
    fontFamily: "serif",
    fontSize: 23,
    textAlign: "center",
    textTransform: "uppercase",
  },
  resumeClassicContact: { justifyContent: "center" },
  resumeHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingBottom: 22,
  },
  resumePhoto: { borderRadius: 50, height: 70, width: 70 },
  resumeIdentity: { flex: 1 },
  resumeKicker: {
    color: colors.accent,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  resumeName: { color: colors.brand, fontSize: 28, fontWeight: "700" },
  resumeContact: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 9,
  },
  resumeContactItem: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 4,
    maxWidth: "100%",
  },
  resumeContactText: { color: "#646761", flexShrink: 1, fontSize: 9 },
  resumeBlock: {
    borderTopColor: "#d8d8d2",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 14,
    paddingVertical: 13,
  },
  resumeBlockContent: { flex: 1 },
  resumeSectionTitle: {
    color: "#bd5b3e",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    width: 75,
  },
  resumeText: { color: "#555852", fontSize: 10, lineHeight: 15 },
  resumeEntry: { marginBottom: 10 },
  entryRole: { color: "#203c3b", fontSize: 11, fontWeight: "700" },
  entryCompany: { color: "#5e625d", fontSize: 9, marginTop: 2 },
  entryDate: { color: "#777a75", fontSize: 8, marginTop: 2 },
  resumeColumns: {
    borderTopColor: "#d8d8d2",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingTop: 13,
  },
  column: { flex: 1 },
  listItem: { marginBottom: 8 },
});
