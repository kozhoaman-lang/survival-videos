import React from 'react';
import { Still } from 'remotion';
import './fonts';
import { SheetDanchik, SheetBakyt, Lineup, W, HH } from './sheets/Sheet';
export const Root: React.FC = () => (<>
  <Still id="SheetDanchik" component={SheetDanchik} width={W} height={HH} />
  <Still id="SheetBakyt" component={SheetBakyt} width={W} height={HH} />
  <Still id="Lineup" component={Lineup} width={W} height={1700} />
</>);
