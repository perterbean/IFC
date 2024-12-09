import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { IfcViewerAPI } from './ifc-view';
import BcfDialog from './components/BcfDialog';
import {Backdrop, CircularProgress, IconButton} from '@material-ui/core';
import FolderOpenOutlinedIcon from '@material-ui/icons/FolderOpenOutlined';
import CropIcon from '@material-ui/icons/Crop';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import { Color } from 'three';
import { IFCOPENINGELEMENT, IFCSPACE } from 'web-ifc';
import { ClippingEdges } from './ifc-view/components/display/clipping-planes/clipping-edges';

function App() {
  const [bcfDialogOpen, setBcfDialogOpen] = useState(false);
  const [loading_ifc, setLoading_ifc] = useState(false);
  const [loadViewed, setLoadViewed] = useState(false);
  const dropzoneRef = useRef<DropzoneRef | null>(null);
  const [view, setView] = useState<IfcViewerAPI | null>(null);
  useEffect(() => {
    const container = document.getElementById('viewer-container');
    if (!container) throw new Error('Could not get container element!');
    if (view || loadViewed) return;
    console.log(view);
    console.log(loadViewed);
    console.log('useEffect');
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    const viewer = new IfcViewerAPI({ container});
    viewer.axes.setAxes();
    viewer.grid.setGrid();

    // viewer.context.ifcCamera.cameraControls;
    viewer.context.renderer.postProduction.active = true;
    viewer.IFC.loader.ifcManager.applyWebIfcConfig({
      USE_FAST_BOOLS: true,
      COORDINATE_TO_ORIGIN: true
    });
    viewer.context.renderer.postProduction.active = false;
    viewer.IFC.loader.ifcManager.setOnProgress((event) => {
      const percentage = Math.floor((event.loaded * 100) / event.total);
      // progressText.innerText = `Loaded ${percentage}%`;
    });
    ClippingEdges.forceStyleUpdate = true;

    viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
      [IFCSPACE]: false,
      [IFCOPENINGELEMENT]: false
    });
    // viewer.IFC.setWasmPath('files');
    // viewer.IFC.setWasmPath('https://web-ifc-threejs-viewer.herokuapp.com/files/');
    viewer.IFC.setWasmPath('../../');
    setView(viewer);
    setLoadViewed(true);
    // this.viewer = viewer;
    // window.onmousemove = viewer.prepickIfcItem;
    window.ondblclick = async () => {

      if (viewer.clipper.active) {
        viewer.clipper.createPlane();
      } else {
        const result = await viewer.IFC.selector.highlightIfcItem(true);
        if (!result) return;
        const { modelID, id } = result;
        const props = await viewer.IFC.getProperties(modelID, id, true, false);
        console.log(props);
      }
    };
    // const container = document.getElementById('viewer-container');
    // if (!container) throw new Error('Could not get container element!');
    // const ifcViewerAPI = new IfcViewerAPI({container});
    // ifcViewerAPI.IFC.getProperties(1, 2, true);
    // ifcViewerAPI.IFC.getModelID();
    // ifcViewerAPI.IFC.getAllItemsOfType(1, 2, true);
    // ifcViewerAPI.IFC.selector.prePickIfcItem();
    // ifcViewerAPI.IFC.selector.pickIfcItem();
    // ifcViewerAPI.IFC.selector.pickIfcItemsByID(1, [2]);
    // ifcViewerAPI.IFC.release();
  }, [loadViewed]);
  const handleCloseBcfDialog = () => {
    setBcfDialogOpen(false);
  };
  const handleOpenViewpoint = (viewpoint: any) => {
    // this.viewer.currentViewpoint = viewpoint;
  };
  const handleClickOpen = () => {
    if (dropzoneRef.current) {
      dropzoneRef.current.open();
    }
  };
  const handleToggleClipping = () => {
    // this.viewer.clipper.active = !this.viewer.clipper.active;
  };
  const onDrop = async (files: any) => {
    console.log(files);
    setLoading_ifc(true);
    if (!view) throw new Error('Viewer not initialized!');
    await view.IFC.loadIfc(files[0], true);
    const  model = await view.IFC.loadIfc(files[0], false);
    await view.shadowDropper.renderShadow(model.modelID);

    // const ifcEntities = this.viewer.IFC.
    // console.log(ifcEntities);
    setLoading_ifc(false);
    const overlay = document.getElementById('loading-overlay');
    overlay && overlay.classList.add('hidden');
    // setl
  };
  return (
    <>
      <BcfDialog
        open={bcfDialogOpen}
        onClose={handleCloseBcfDialog}
        onOpenViewpoint={handleOpenViewpoint}
      />
      <div style={{ display: 'flex', flexDirection: 'row', height: '100vh' }}>
        <aside style={{ width: 50 }}>
          <IconButton onClick={handleClickOpen}>
            <FolderOpenOutlinedIcon />
          </IconButton>
          <IconButton onClick={handleToggleClipping}>
            <CropIcon />
          </IconButton>
          {/*  <IconButton onClick={handleOpenBcfDialog}>
                          <FeedbackOutlinedIcon />
                      </IconButton>*/}
        </aside>
        <Dropzone ref={dropzoneRef} onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} />
            </div>
          )}
        </Dropzone>
        <div id="viewer-container" style={{ position: 'relative', height: '100%', width: '100%' }} />
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>

        </div>
      </div>
      <Backdrop
        style={{
          zIndex: 100,
          display: 'flex',
          alignItems: "center",
          alignContent: "center"
        }}
        open={loading_ifc}
      >
        <CircularProgress/>
      </Backdrop>
    </>
  );
}

export default App;
