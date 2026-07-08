import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { useEvolucaoAnual } from '@/hooks/useEvolucaoAnual'
import { EvolucaoChart } from '@/components/charts/EvolucaoChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { downloadCsv } from '@/lib/exportCsv'

export default function GestorRelatorios() {
  const now = new Date()
  const ano = now.getFullYear()
  const { pontos, vendedoras, loading } = useEvolucaoAnual(ano, now.getMonth() + 1)
  const [exporting, setExporting] = useState(false)

  async function exportar() {
    setExporting(true)
    const [{ data: registros, error }, { data: vendedorasData }, { data: acoesData }] =
      await Promise.all([
        supabase
          .from('registros')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('vendedoras').select('id, nome'),
        supabase.from('acoes_catalogo').select('id, descricao'),
      ])
    setExporting(false)
    if (error || !registros) {
      toast.error('Não foi possível exportar.')
      return
    }
    const vendedoraPorId = new Map((vendedorasData ?? []).map((v) => [v.id, v.nome]))
    const acaoPorId = new Map((acoesData ?? []).map((a) => [a.id, a.descricao]))

    downloadCsv(
      `reconluz-premia-registros-${ano}.csv`,
      ['Vendedora', 'Ação', 'Quantidade', 'Pontos', 'Cliente', 'Status', 'Data', 'Criado em'],
      registros.map((r) => [
        vendedoraPorId.get(r.vendedora_id) ?? r.vendedora_id,
        acaoPorId.get(r.acao_id) ?? r.acao_id,
        r.quantidade,
        r.pontos_calculados,
        r.cliente ?? '',
        r.status,
        r.data_ocorrencia,
        new Date(r.created_at).toLocaleString('pt-BR'),
      ]),
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <Button variant="outline" size="sm" onClick={exportar} disabled={exporting}>
          <Download className="size-4" />
          {exporting ? 'Exportando…' : 'Exportar CSV'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução de pontos em {ano}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <EvolucaoChart data={pontos} vendedoras={vendedoras} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
