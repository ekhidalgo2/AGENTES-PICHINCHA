import { useState } from "react";
import mapioLogo from "../../Mapio by MHCONSULTANCY.jpeg";
import mhLogo from "../../Logo MH.jpeg";

const navigation = [
  { label: "Inicio", icon: "home" },
  { label: "Expedientes", icon: "folder" },
  { label: "Guías", icon: "book" },
  { label: "Indicadores", icon: "chart" },
  { label: "Configuración", icon: "settings" },
];

const workspace = [
  { label: "Documentos", icon: "document" },
  { label: "Entrevistas", icon: "people" },
  { label: "Diagrama AS-IS", icon: "diagram" },
  { label: "A3", icon: "a3" },
  { label: "Revisión", icon: "review" },
];

function NavigationIcon({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className={`navigation-icon icon-${name}`}
    />
  );
}

function NavigationGroup({
  items,
  selected,
  onSelect,
}: {
  items: typeof navigation;
  selected: string;
  onSelect: (label: string) => void;
}) {
  return (
    <nav aria-label="Navegación principal">
      {items.map((item) => (
        <button
          className={`nav-item${selected === item.label ? " selected" : ""}`}
          key={item.label}
          onClick={() => onSelect(item.label)}
          type="button"
        >
          <NavigationIcon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function App() {
  const [selected, setSelected] = useState("Inicio");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a aria-label="Mapio by MHCONSULTANCY, inicio" className="brand" href="/">
          <img alt="Mapio by MHCONSULTANCY" src={mapioLogo} />
        </a>
        <div className="sidebar-label">GESTIÓN</div>
        <NavigationGroup items={navigation} selected={selected} onSelect={setSelected} />
        <div className="sidebar-divider" />
        <div className="sidebar-label">TRABAJO DEL PROCESO</div>
        <NavigationGroup items={workspace} selected={selected} onSelect={setSelected} />
        <div className="sidebar-footer">
          <span>Personas · Estrategia · Resultados</span>
          <img alt="MHCONSULTANCY" src={mhLogo} />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Mapio <span>/</span> {selected}</div>
          <button className="profile-button" type="button" aria-label="Perfil de usuario">
            <span className="avatar">MH</span>
            <span>Equipo MH</span>
            <span aria-hidden="true">⌄</span>
          </button>
        </header>

        <section className="dashboard" aria-labelledby="welcome-title">
          <div className="welcome-panel">
            <div className="welcome-copy">
              <p className="eyebrow">LEVANTAMIENTO DE PROCESOS</p>
              <h1 id="welcome-title">Ideas que dejan huella.</h1>
              <p className="welcome-description">
                Organiza la evidencia, comprende el proceso y construye un AS-IS
                trazable, paso a paso.
              </p>
              <button className="primary-button" onClick={() => setSelected("Expedientes")} type="button">
                <span aria-hidden="true">＋</span> Crear expediente
              </button>
            </div>
            <div className="welcome-mark" aria-hidden="true">
              <span className="leaf leaf-one" />
              <span className="leaf leaf-two" />
              <span className="leaf leaf-three" />
            </div>
          </div>

          <div className="section-heading">
            <div>
              <p className="eyebrow">TU ESPACIO DE TRABAJO</p>
              <h2>Continuar trabajando</h2>
            </div>
            <button className="text-button" onClick={() => setSelected("Expedientes")} type="button">
              Ver expedientes <span aria-hidden="true">→</span>
            </button>
          </div>

          <section aria-label="Resumen del espacio de trabajo" className="summary-grid">
            <article className="summary-card">
              <span className="summary-icon"><NavigationIcon name="folder" /></span>
              <p>Expedientes activos</p>
              <strong>—</strong>
              <span className="card-note">Tus procesos aparecerán aquí</span>
            </article>
            <article className="summary-card">
              <span className="summary-icon"><NavigationIcon name="people" /></span>
              <p>Entrevistas pendientes</p>
              <strong>—</strong>
              <span className="card-note">Sesiones por preparar o sincronizar</span>
            </article>
            <article className="summary-card">
              <span className="summary-icon"><NavigationIcon name="review" /></span>
              <p>Revisiones por atender</p>
              <strong>—</strong>
              <span className="card-note">Diagramas que esperan validación</span>
            </article>
          </section>

          <section className="empty-workspace">
            <span className="empty-mark" aria-hidden="true">✦</span>
            <div>
              <h2>Tu próximo proceso empieza aquí</h2>
              <p>Crea un expediente para reunir documentos, entrevistas y evidencia en un solo lugar.</p>
            </div>
            <button className="secondary-button" onClick={() => setSelected("Expedientes")} type="button">
              Explorar expedientes
            </button>
          </section>
        </section>

        <footer className="page-footer">
          <span>Mapio by MHCONSULTANCY <span className="footer-dot">·</span> Levantamiento de procesos</span>
          <span>Una mejor mañana es una decisión de hoy.</span>
        </footer>
      </main>
    </div>
  );
}
