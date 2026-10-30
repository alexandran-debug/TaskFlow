import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Tarea = {
  id: string;
  titulo: string;
  descripcion: string;
  completada: boolean;
};

const CLAVE_ALMACENAMIENTO = "@taskflow/tareas";

export default function HomeScreen() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tareaEditando, setTareaEditando] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "completadas">(
    "todas",
  );
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarTareas() {
      try {
        const datosGuardados = await AsyncStorage.getItem(CLAVE_ALMACENAMIENTO);

        if (datosGuardados) {
          const tareasGuardadas: Tarea[] = JSON.parse(datosGuardados);
          setTareas(tareasGuardadas);
        }
      } catch (error) {
        Alert.alert("Aviso", "No se pudieron cargar las tareas guardadas.");
      } finally {
        setCargando(false);
      }
    }

    cargarTareas();
  }, []);

  useEffect(() => {
    if (cargando) return;

    async function guardarTareas() {
      try {
        await AsyncStorage.setItem(
          CLAVE_ALMACENAMIENTO,
          JSON.stringify(tareas),
        );
      } catch (error) {
        Alert.alert("Error", "No se pudieron guardar las tareas.");
      }
    }

    guardarTareas();
  }, [tareas, cargando]);

  const pendientes = tareas.filter((tarea) => !tarea.completada).length;
  const completadas = tareas.filter((tarea) => tarea.completada).length;

  const tareasFiltradas = tareas.filter((tarea) => {
    if (filtro === "pendientes") return !tarea.completada;
    if (filtro === "completadas") return tarea.completada;
    return true;
  });

  function limpiarFormulario() {
    setTitulo("");
    setDescripcion("");
    setTareaEditando(null);
    setMostrarFormulario(false);
  }

  function guardarTarea() {
    if (!titulo.trim()) {
      Alert.alert("Falta el título", "Escribe un título para la tarea.");
      return;
    }

    if (tareaEditando) {
      setTareas((anteriores) =>
        anteriores.map((tarea) =>
          tarea.id === tareaEditando
            ? {
                ...tarea,
                titulo: titulo.trim(),
                descripcion: descripcion.trim(),
              }
            : tarea,
        ),
      );
    } else {
      const nuevaTarea: Tarea = {
        id: Date.now().toString(),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        completada: false,
      };

      setTareas((anteriores) => [nuevaTarea, ...anteriores]);
    }

    limpiarFormulario();
  }

  function editarTarea(tarea: Tarea) {
    setTitulo(tarea.titulo);
    setDescripcion(tarea.descripcion);
    setTareaEditando(tarea.id);
    setMostrarFormulario(true);
  }

  function eliminarTarea(id: string) {
    Alert.alert(
      "Eliminar tarea",
      "¿Estás segura de que deseas eliminar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            setTareas((anteriores) =>
              anteriores.filter((tarea) => tarea.id !== id),
            ),
        },
      ],
    );
  }

  function cambiarEstado(id: string) {
    setTareas((anteriores) =>
      anteriores.map((tarea) =>
        tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea,
      ),
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.marca}>TASKFLOW</Text>
            <Text style={styles.tituloPrincipal}>Organiza tu día.</Text>
            <Text style={styles.subtitulo}>
              Pequeños pasos, grandes logros.
            </Text>
          </View>
          <View style={styles.iconoEncabezado}>
            <Text style={styles.iconoTexto}>✓</Text>
          </View>
        </View>

        <View style={styles.resumen}>
          <View style={styles.tarjetaResumen}>
            <Text style={styles.numeroResumen}>{tareas.length}</Text>
            <Text style={styles.textoResumen}>Total</Text>
          </View>
          <View style={styles.tarjetaResumen}>
            <Text style={styles.numeroResumen}>{pendientes}</Text>
            <Text style={styles.textoResumen}>Pendientes</Text>
          </View>
          <View style={styles.tarjetaResumen}>
            <Text style={styles.numeroResumen}>{completadas}</Text>
            <Text style={styles.textoResumen}>Completadas</Text>
          </View>
        </View>

        <View style={styles.tituloSeccion}>
          <View style={styles.encabezadoLista}>
            <Text style={styles.tituloLista}>Mis tareas</Text>
            <Text style={styles.descripcionSeccion}>
              Mantén tus actividades bajo control.
            </Text>
          </View>
          <Pressable
            style={styles.botonAgregar}
            onPress={() => {
              limpiarFormulario();
              setMostrarFormulario(true);
            }}
          >
            <Text style={styles.textoBotonAgregar}>+ Nueva</Text>
          </Pressable>
        </View>

        {mostrarFormulario && (
          <View style={styles.formulario}>
            <Text style={styles.tituloFormulario}>
              {tareaEditando ? "Editar tarea" : "Crear una tarea"}
            </Text>

            <Text style={styles.etiqueta}>Título *</Text>
            <TextInput
              style={styles.campo}
              placeholder="Ej. Estudiar programación"
              placeholderTextColor="#9299A8"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={80}
              accessibilityLabel="Título de la tarea"
            />

            <Text style={styles.etiqueta}>Descripción</Text>
            <TextInput
              style={[styles.campo, styles.campoDescripcion]}
              placeholder="Agrega algunos detalles..."
              placeholderTextColor="#9299A8"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              maxLength={300}
              accessibilityLabel="Descripción de la tarea"
            />

            <View style={styles.botonesFormulario}>
              <Pressable
                style={styles.botonCancelar}
                onPress={limpiarFormulario}
              >
                <Text style={styles.textoCancelar}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.botonGuardar} onPress={guardarTarea}>
                <Text style={styles.textoGuardar}>
                  {tareaEditando ? "Guardar cambios" : "Crear tarea"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtros}
          contentContainerStyle={styles.contenidoFiltros}
        >
          {[
            { valor: "todas", texto: "Todas" },
            { valor: "pendientes", texto: "Pendientes" },
            { valor: "completadas", texto: "Completadas" },
          ].map((opcion) => (
            <Pressable
              key={opcion.valor}
              style={[
                styles.botonFiltro,
                filtro === opcion.valor && styles.botonFiltroActivo,
              ]}
              onPress={() =>
                setFiltro(
                  opcion.valor as "todas" | "pendientes" | "completadas",
                )
              }
            >
              <Text
                style={[
                  styles.textoFiltro,
                  filtro === opcion.valor && styles.textoFiltroActivo,
                ]}
              >
                {opcion.texto}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {cargando ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.tituloVacio}>Cargando tus tareas...</Text>
          </View>
        ) : tareasFiltradas.length === 0 ? (
          <View style={styles.estadoVacio}>
            <View style={styles.iconoVacio}>
              <Text style={styles.iconoVacioTexto}>✓</Text>
            </View>
            <Text style={styles.tituloVacio}>
              {filtro === "completadas"
                ? "Aún no hay tareas completadas"
                : filtro === "pendientes"
                  ? "¡No tienes tareas pendientes!"
                  : "Comienza con tu primera tarea"}
            </Text>
            <Text style={styles.textoVacio}>
              {filtro === "todas"
                ? "Agrega una tarea y empieza a organizar tu día."
                : "Cuando tengas tareas en esta categoría, aparecerán aquí."}
            </Text>
            {filtro === "todas" && (
              <Pressable
                style={styles.botonVacio}
                onPress={() => setMostrarFormulario(true)}
              >
                <Text style={styles.textoBotonVacio}>
                  + Crear mi primera tarea
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.listaTareas}>
            {tareasFiltradas.map((tarea) => (
              <View key={tarea.id} style={styles.tarjetaTarea}>
                <Pressable
                  style={[
                    styles.checkbox,
                    tarea.completada && styles.checkboxActivo,
                  ]}
                  onPress={() => cambiarEstado(tarea.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: tarea.completada }}
                  accessibilityLabel={`Marcar ${tarea.titulo} como ${
                    tarea.completada ? "pendiente" : "completada"
                  }`}
                >
                  {tarea.completada && (
                    <Text style={styles.marcaCheckbox}>✓</Text>
                  )}
                </Pressable>

                <View style={styles.informacionTarea}>
                  <Text
                    style={[
                      styles.tituloTarea,
                      tarea.completada && styles.tareaTerminada,
                    ]}
                  >
                    {tarea.titulo}
                  </Text>
                  {tarea.descripcion ? (
                    <Text style={styles.descripcionTarea}>
                      {tarea.descripcion}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      styles.estadoTarea,
                      tarea.completada
                        ? styles.estadoCompletada
                        : styles.estadoPendiente,
                    ]}
                  >
                    {tarea.completada ? "COMPLETADA" : "PENDIENTE"}
                  </Text>
                </View>

                <View style={styles.accionesTarea}>
                  <Pressable
                    style={styles.botonAccion}
                    onPress={() => editarTarea(tarea)}
                    accessibilityLabel={`Editar ${tarea.titulo}`}
                  >
                    <Text style={styles.textoEditar}>Editar</Text>
                  </Pressable>
                  <Pressable
                    style={styles.botonAccion}
                    onPress={() => eliminarTarea(tarea.id)}
                    accessibilityLabel={`Eliminar ${tarea.titulo}`}
                  >
                    <Text style={styles.textoEliminar}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.pie}>
          <Text style={styles.textoPie}>TASKFLOW · Un paso a la vez.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F5F7FB" },
  contenido: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 45,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  marca: {
    color: "#5965D9",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 10,
  },
  tituloPrincipal: { color: "#20263A", fontSize: 30, fontWeight: "800" },
  subtitulo: { color: "#747D91", fontSize: 14, marginTop: 7 },
  iconoEncabezado: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#5965D9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconoTexto: { color: "#FFFFFF", fontSize: 28, fontWeight: "700" },
  resumen: { flexDirection: "row", gap: 12, marginBottom: 32 },
  tarjetaResumen: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECF4",
  },
  numeroResumen: {
    color: "#292F45",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },
  textoResumen: {
    color: "#81899B",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },
  tituloSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  encabezadoLista: { flex: 1 },
  tituloLista: { color: "#242A3D", fontSize: 22, fontWeight: "800" },
  descripcionSeccion: { color: "#858DA0", fontSize: 12, marginTop: 5 },
  botonAgregar: {
    backgroundColor: "#5965D9",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  textoBotonAgregar: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  formulario: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E6E9F2",
    padding: 19,
    marginBottom: 22,
  },
  tituloFormulario: {
    color: "#252B40",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 18,
  },
  etiqueta: {
    color: "#41495E",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  campo: {
    borderWidth: 1,
    borderColor: "#E1E5EF",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: "#292F43",
    marginBottom: 17,
    backgroundColor: "#FCFCFE",
  },
  campoDescripcion: { minHeight: 90, textAlignVertical: "top" },
  botonesFormulario: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  botonCancelar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F0F2F8",
  },
  textoCancelar: { color: "#606A80", fontSize: 13, fontWeight: "700" },
  botonGuardar: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#5965D9",
  },
  textoGuardar: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  filtros: { marginBottom: 18, flexGrow: 0 },
  contenidoFiltros: { gap: 9 },
  botonFiltro: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E9F2",
  },
  botonFiltroActivo: { backgroundColor: "#E8EAFE", borderColor: "#D5D9FF" },
  textoFiltro: { color: "#737C90", fontSize: 13, fontWeight: "600" },
  textoFiltroActivo: { color: "#505BD0", fontWeight: "800" },
  estadoVacio: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 25,
    paddingVertical: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECF4",
  },
  iconoVacio: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#EEF0FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  iconoVacioTexto: { color: "#5965D9", fontSize: 29, fontWeight: "800" },
  tituloVacio: {
    color: "#343B50",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  textoVacio: {
    color: "#858DA0",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 9,
    maxWidth: 310,
  },
  botonVacio: {
    backgroundColor: "#5965D9",
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  textoBotonVacio: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  listaTareas: { gap: 13 },
  tarjetaTarea: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9ECF4",
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#C9CEDD",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActivo: { backgroundColor: "#5965D9", borderColor: "#5965D9" },
  marcaCheckbox: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  informacionTarea: { flex: 1, minWidth: 0 },
  tituloTarea: {
    color: "#30364B",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  tareaTerminada: { color: "#969DAE", textDecorationLine: "line-through" },
  descripcionTarea: {
    color: "#81899B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  estadoTarea: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 11,
  },
  estadoPendiente: { color: "#C18431" },
  estadoCompletada: { color: "#319A78" },
  accionesTarea: { alignItems: "flex-end", gap: 12 },
  botonAccion: { paddingVertical: 3, paddingHorizontal: 2 },
  textoEditar: { color: "#5965D9", fontSize: 12, fontWeight: "700" },
  textoEliminar: { color: "#D65C68", fontSize: 12, fontWeight: "700" },
  pie: {
    alignItems: "center",
    marginTop: 35,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E9F1",
  },
  textoPie: { color: "#969DAE", fontSize: 11, letterSpacing: 1 },
});
