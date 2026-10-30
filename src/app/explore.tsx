import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Tarea = {
  id: string;
  titulo: string;
  descripcion: string;
  completada: boolean;
};

const CLAVE_ALMACENAMIENTO = "@taskflow/tareas";

export default function ProgresoScreen() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar las tareas cada vez que se abre esta pantalla.
  useFocusEffect(
    useCallback(() => {
      let activa = true;

      async function cargarTareas() {
        try {
          const datos = await AsyncStorage.getItem(CLAVE_ALMACENAMIENTO);

          if (activa) {
            setTareas(datos ? JSON.parse(datos) : []);
          }
        } catch (error) {
          console.error("No se pudieron cargar las tareas:", error);
          if (activa) setTareas([]);
        } finally {
          if (activa) setCargando(false);
        }
      }

      setCargando(true);
      cargarTareas();

      return () => {
        activa = false;
      };
    }, []),
  );

  const total = tareas.length;
  const completadas = tareas.filter((tarea) => tarea.completada).length;
  const pendientes = total - completadas;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  function obtenerMensaje() {
    if (total === 0) return "¡Comienza con tu primera tarea!";
    if (porcentaje === 100) return "¡Excelente! Has completado todo.";
    if (porcentaje >= 70) return "¡Vas muy bien! Sigue así.";
    if (porcentaje >= 40) return "¡Buen avance! Continúa paso a paso.";
    return "Cada pequeño paso cuenta. ¡Tú puedes!";
  }

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#5965D9" />
        <Text style={styles.textoCargando}>Cargando tu progreso...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.encabezado}>
        <Text style={styles.marca}>TASKFLOW</Text>
        <Text style={styles.tituloPrincipal}>Mi progreso</Text>
        <Text style={styles.subtitulo}>
          Cada tarea completada es un paso adelante.
        </Text>
      </View>

      <View style={styles.tarjetaPrincipal}>
        <Text style={styles.etiquetaProgreso}>TU AVANCE GENERAL</Text>
        <Text style={styles.porcentaje}>{porcentaje}%</Text>

        <View
          style={styles.barraFondo}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: porcentaje,
          }}
        >
          <View style={[styles.barraAvance, { width: `${porcentaje}%` }]} />
        </View>

        <Text style={styles.mensaje}>{obtenerMensaje()}</Text>
      </View>

      <Text style={styles.tituloSeccion}>Resumen de actividades</Text>

      <View style={styles.tarjetasResumen}>
        <View style={styles.tarjetaResumen}>
          <Text style={styles.numeroTotal}>{total}</Text>
          <Text style={styles.textoResumen}>Total</Text>
        </View>

        <View style={styles.tarjetaResumen}>
          <Text style={styles.numeroCompletadas}>{completadas}</Text>
          <Text style={styles.textoResumen}>Completadas</Text>
        </View>

        <View style={styles.tarjetaResumen}>
          <Text style={styles.numeroPendientes}>{pendientes}</Text>
          <Text style={styles.textoResumen}>Pendientes</Text>
        </View>
      </View>

      <View style={styles.tarjetaDetalle}>
        <Text style={styles.tituloDetalle}>Tu actividad</Text>

        <View style={styles.filaDetalle}>
          <View style={styles.etiquetaFila}>
            <View style={styles.puntoCompletadas} />
            <Text style={styles.textoDetalle}>Tareas completadas</Text>
          </View>
          <Text style={styles.valorDetalle}>{completadas}</Text>
        </View>

        <View style={styles.filaDetalle}>
          <View style={styles.etiquetaFila}>
            <View style={styles.puntoPendientes} />
            <Text style={styles.textoDetalle}>Tareas pendientes</Text>
          </View>
          <Text style={styles.valorDetalle}>{pendientes}</Text>
        </View>
      </View>

      <View style={styles.pie}>
        <Text style={styles.textoPie}>TASKFLOW · Un paso a la vez.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  contenido: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 35,
    paddingBottom: 45,
  },
  cargando: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    justifyContent: "center",
    alignItems: "center",
  },
  textoCargando: {
    color: "#747D91",
    marginTop: 12,
    fontSize: 14,
  },
  encabezado: {
    marginBottom: 28,
  },
  marca: {
    color: "#5965D9",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 10,
  },
  tituloPrincipal: {
    color: "#20263A",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitulo: {
    color: "#747D91",
    fontSize: 14,
    marginTop: 7,
  },
  tarjetaPrincipal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E9ECF4",
    marginBottom: 30,
  },
  etiquetaProgreso: {
    color: "#81899B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  porcentaje: {
    color: "#5965D9",
    fontSize: 44,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 17,
  },
  barraFondo: {
    height: 12,
    backgroundColor: "#E8EAFE",
    borderRadius: 10,
    overflow: "hidden",
  },
  barraAvance: {
    height: "100%",
    backgroundColor: "#5965D9",
    borderRadius: 10,
  },
  mensaje: {
    color: "#747D91",
    fontSize: 13,
    marginTop: 16,
  },
  tituloSeccion: {
    color: "#242A3D",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  tarjetasResumen: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  tarjetaResumen: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E9ECF4",
    paddingVertical: 19,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  numeroTotal: {
    color: "#292F45",
    fontSize: 25,
    fontWeight: "800",
  },
  numeroCompletadas: {
    color: "#319A78",
    fontSize: 25,
    fontWeight: "800",
  },
  numeroPendientes: {
    color: "#C18431",
    fontSize: 25,
    fontWeight: "800",
  },
  textoResumen: {
    color: "#81899B",
    fontSize: 11,
    marginTop: 7,
    textAlign: "center",
  },
  tarjetaDetalle: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECF4",
    padding: 19,
  },
  tituloDetalle: {
    color: "#30364B",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 20,
  },
  filaDetalle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  etiquetaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  puntoCompletadas: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#319A78",
  },
  puntoPendientes: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C18431",
  },
  textoDetalle: {
    color: "#747D91",
    fontSize: 13,
  },
  valorDetalle: {
    color: "#30364B",
    fontSize: 14,
    fontWeight: "800",
  },
  pie: {
    alignItems: "center",
    marginTop: 35,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E9F1",
  },
  textoPie: {
    color: "#969DAE",
    fontSize: 11,
    letterSpacing: 1,
  },
});
