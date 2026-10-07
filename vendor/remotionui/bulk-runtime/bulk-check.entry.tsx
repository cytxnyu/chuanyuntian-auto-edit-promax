import {Composition, registerRoot} from 'remotion';
import {Suspense} from 'react';
import {remotionuiBulkComponents} from '../../../packages/remotion-renderer/src/external/providers/remotionui-bulk';
const Scene = ({sourceId}: {sourceId: string}) => {const Component=remotionuiBulkComponents[sourceId];return <Suspense fallback={null}><Component/></Suspense>;};
registerRoot(() => <Composition id="RemotionUIBulkStatic" component={Scene} width={960} height={540} fps={30} durationInFrames={120} defaultProps={{sourceId:Object.keys(remotionuiBulkComponents)[0]}}/>);
