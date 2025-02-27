import type { NextApiRequest, NextApiResponse } from 'next'

import { Buff } from '@cmdcode/buff-utils'
import { withSessionRoute } from '@/lib/sessions'
import { openChannel } from '@/lib/lnd'

export default withSessionRoute(handler)

async function handler (
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  try {
    const { pubkey, invoice } = req.session

    if (pubkey === undefined) {
      return res.status(200).json({ ok: false, err: 'Session has expired!' })
    }

    if (invoice === undefined) {
      return res.status(200).json({ ok: false, err: 'There is no invoice!' })
    }

    if (!invoice.paid) {
      return res.status(200).json({ ok: false, err: 'Invoice has not been paid!' })
    }

    const amount = 25000

    const { ok, data, status = 500 , err } = await openChannel(pubkey, amount)

    if (!ok) {
      return res.status(status).json({ ok: false, ...data, err })
    }

    const { funding_txid_bytes, output_index } = data
    const txid = Buff.base64(funding_txid_bytes).hex
    const opentx = { txid, vout: output_index }

    req.session.opentx = opentx
    await req.session.save()

    return res.status(200).json({ ok: true, data: opentx })
  } catch(err) { 
    console.error('err:', err)
    res.status(500).end()
  }
}
