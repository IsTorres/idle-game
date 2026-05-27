import { useGameStore } from '../../store/gameStore';

interface OfflineReportData {
  visible: boolean;
  ticksSimulated: number;
  goldEarned: number;
  expEarned: number;
  died: boolean;
}

export function OfflineReport({ report }: { report: OfflineReportData | null }) {
  const setOfflineReport = (val: null) => useGameStore.setState({ offlineReport: val });

  if (!report?.visible) return null;

  const minutes = Math.floor(report.ticksSimulated / 60);
  const seconds = report.ticksSimulated % 60;

  return (
    <div className="modal-overlay" onClick={() => setOfflineReport(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4">Bem-vindo de volta!</h3>
        <p className="text-sm text-muted mb-2">
          Você ficou ausente por {minutes}m {seconds}s.
        </p>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between">
            <span className="text-muted">Ticks simulados:</span>
            <span>{report.ticksSimulated}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Ouro ganho:</span>
            <span className="text-gold">{report.goldEarned}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Experiência ganha:</span>
            <span>{report.expEarned}</span>
          </div>
          {report.died && (
            <div className="text-danger text-sm mt-2">
              Seu personagem morreu durante sua ausência e retornou à cidade.
            </div>
          )}
        </div>
        <button className="btn-primary w-full" onClick={() => setOfflineReport(null)}>
          Continuar
        </button>
      </div>
    </div>
  );
}
