<template>
  <div class="abnormal-date-container">
    <h1 class="main-title">传感器状态异常分布</h1>

    <div class="main-container">
      <div class="letter-container" id="letterContainer">
        <div class="letter-title">库壁应力计</div>
        <div style="display: flex; align-items: flex-end; gap: 1vw;">
          <!-- A区域: 10个 = 1列 -->
          <div class="letter-item">
            <div class="letter">A</div>
            <div class="letter-box cols-1" id="letterA">
              <div class="sensor-cell" data-id="GBC1-A-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-A-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-A-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
          <!-- B区域: 32个 = 4列 -->
          <div class="letter-item">
            <div class="letter">B</div>
            <div class="letter-box cols-4" id="letterB">
              <div class="sensor-cell" data-id="GBC1-B-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-B-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-B-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC10-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC10-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC11-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC11-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC12-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC12-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC13-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC13-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC14-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC14-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC15-B-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC15-B-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC16-B-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
          <!-- C区域: 10个 = 1列 -->
          <div class="letter-item">
            <div class="letter">C</div>
            <div class="letter-box cols-1" id="letterC">
              <div class="sensor-cell" data-id="GBC1-C-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-C-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-C-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
          <!-- D区域: 26个 = 3列 -->
          <div class="letter-item">
            <div class="letter">D</div>
            <div class="letter-box cols-3" id="letterD">
              <div class="sensor-cell" data-id="GBC1-D-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-D-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-D-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC10-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC11-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC12-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC13-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC14-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC15-D-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC16-D-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
          <!-- E区域: 10个 = 1列 -->
          <div class="letter-item">
            <div class="letter">E</div>
            <div class="letter-box cols-1" id="letterE">
              <div class="sensor-cell" data-id="GBC1-E-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-E-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-E-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
          <!-- F区域: 31个 = 4列 -->
          <div class="letter-item">
            <div class="letter">F</div>
            <div class="letter-box cols-4" id="letterF">
              <div class="sensor-cell" data-id="GBC1-F-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-F-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC10-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC10-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC11-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC11-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC12-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC12-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC13-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC13-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC14-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC14-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC15-F-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC15-F-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC16-F-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
          <!-- G区域: 10个 = 1列 -->
          <div class="letter-item">
            <div class="letter">G</div>
            <div class="letter-box cols-1" id="letterG">
              <div class="sensor-cell" data-id="GBC1-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-G-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-G-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-G-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
          <!-- H区域: 26个 = 3列 -->
          <div class="letter-item">
            <div class="letter">H</div>
            <div class="letter-box cols-3" id="letterH">
              <div class="sensor-cell" data-id="GBC1-H-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC1-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC2-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-H-R" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC3-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC4-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC5-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC6-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC7-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-H-R-V" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC8-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC9-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC10-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC11-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC12-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC13-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC14-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC15-H-L" data-type="strain" @click="toggleShowId($event)"></div>
              <div class="sensor-cell" data-id="GBC16-H-L" data-type="strain" @click="toggleShowId($event)"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-container" id="bottomContainer">
        <div class="outer-frame" id="sensorOuterFrame">
          <div class="horizontal-sensors">
            <div class="horizontal-sensor-group inclination-group">
              <div class="horizontal-label">倾角计</div>
              <div class="bottom-box">
                <div class="bottom-grid-1xN" id="inclinationSensors">
                  <div class="sensor-cell" data-id="GBC7-B-R" data-type="tilt" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="GBC7-D-R" data-type="tilt" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="GBC7-H-R" data-type="tilt" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="GBC7-F-R" data-type="tilt" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="GBC16-B-R" data-type="tilt" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="GBC16-D-R" data-type="tilt" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="GBC16-F-R" data-type="tilt" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="GBC16-H-R" data-type="tilt" @click="toggleShowId($event)"></div>
                </div>
              </div>
            </div>

            <div class="horizontal-sensor-group settlement-group">
              <div class="horizontal-label">沉降仪</div>
              <div class="bottom-box">
                <div class="bottom-grid-1xN" id="settlementSensors">
                  <div class="sensor-cell" data-id="横向桥架A" data-type="settlement" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="横向桥架B" data-type="settlement" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="横向桥架C" data-type="settlement" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="横向桥架D" data-type="settlement" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="横向桥架E" data-type="settlement" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="横向桥架F" data-type="settlement" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="横向桥架G" data-type="settlement" @click="toggleShowId($event)"></div>
                </div>
              </div>
            </div>

            <!-- 库底埋入型应力计区域 -->
            <div class="horizontal-sensor-group pile-group">
              <div class="horizontal-label">库底埋入型应力计</div>
              <div class="bottom-box">
                <div class="bottom-grid-1xN" id="pileSensors">
                  <div class="sensor-cell" data-id="ZY1" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY2" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY3" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY6" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY7" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY8" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY9" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY10" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY11" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY13" data-type="pile" @click="toggleShowId($event)"></div>
                  <div class="sensor-cell" data-id="ZY16" data-type="pile" @click="toggleShowId($event)"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="kudi-container">
          <div class="kudi-title">钢筋型应力计</div>
          <div class="bottom-flex-row" id="rebarSensors">
            <div class="sensor-cell" data-id="ZS3A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS3B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS3C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS4A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS4B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS5A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS5B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS5C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS8A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS8B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS8C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS10A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS10B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS11B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS11C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS13A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS13B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS14A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS14C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS16B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS16C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS18A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS18B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS18C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS20A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS20C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS21A" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS21B" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS21C" data-type="rebar" @click="toggleShowId($event)"></div>
            <div class="sensor-cell" data-id="ZS14B" data-type="rebar" @click="toggleShowId($event)"></div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="legend-container">
          <div class="legend-item">
            <div class="sensor-cell status-normal"></div>
            <span class="legend-text">工作正常</span>
          </div>
          <div class="legend-item">
            <div class="sensor-cell status-warning"></div>
            <span class="legend-text">数据异常</span>
          </div>
          <div class="legend-item">
            <div class="sensor-cell status-danger"></div>
            <span class="legend-text">通讯异常</span>
          </div>
          <div class="legend-item">
            <div class="sensor-cell status-critical"></div>
            <span class="legend-text">设备异常</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryUrl } from '@/constants/api';
export default {
  name: 'abnormalDate',
  data() {
    return {
      sensorData:[],
      // 状态映射：0=正常, 1=数据异常, 2=通讯异常, null=设备异常
      statusMap: {
        0: { class: 'status-normal', text: '工作正常' },
        1: { class: 'status-warning', text: '数据异常' },
        2: { class: 'status-danger', text: '通讯异常' },
        'null': { class: 'status-critical', text: '设备异常' }
      }
    };
  },
  mounted() {
    setInterval(async () => {
      this.sensorData = await this.combineArr();
    }, 1800000);
    // 页面加载完成后执行
    this.loadSensorData();
  },
  watch:{
    sensorData:{
      handler(){
        this.loadSensorData();
      },
      deep:true
    }
  },
  methods: {
    // 切换显示传感器ID
    toggleShowId(event) {
      event.target.classList.toggle('show-id');
    },

    // 获取历史数据 - 增加limit确保获取所有数据
    async getHistoryData(tableName, limit) {
      try {
        if (!tableName || typeof tableName !== 'string') {
          throw new Error('表名必须是有效的字符串');
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 10000) {
          throw new Error('limit 必须是 1-10000 之间的整数');
        }

        const res = await fetch(queryUrl(tableName, limit));
        if (!res.ok) {
          throw new Error(`HTTP 错误: ${res.status}`);
        }

        const result = await res.json();
        return result.data || [];
      } catch (err) {
        console.error('获取历史数据错误:', err);
        throw err;
      }
    },

    async combineArr() {
      // 增加limit确保获取所有传感器数据
      const strainData = await this.getHistoryData('strainStatus', 199);
      const tiltData = await this.getHistoryData('TiltStatus', 8);
      const settlementData = await this.getHistoryData('settlementstatus', 7);
      return [...strainData, ...settlementData, ...tiltData];
    },

    // 辅助函数：安全格式化数字
    formatNumber(value, decimals = 2) {
      if (value === undefined || value === null || value === '') return null;
      const num = Number(value);
      return isNaN(num) ? String(value) : num.toFixed(decimals);
    },

    // 辅助函数：获取状态信息
    getStatusInfo(status) {
      const key = status === null ? 'null' : status;
      return this.statusMap[key] || { class: 'status-critical', text: '设备异常' };
    },

    // 判断是否为有效数据 - 修复：只检查业务数据字段
    hasValidData(data) {
      // 定义业务数据字段（排除元数据）
      const businessFields = ['应变值', '沉降值', 'X向倾角(°)', 'Y向倾角(°)', '状态', '异常情况'];

      return businessFields.some(field => {
        return data[field] !== null && data[field] !== undefined;
      });
    },

    // 智能匹配传感器ID - 处理GBCT vs GBC的差异
    normalizeSensorId(id) {
      if (!id) return id;

      // 处理GBCT开头的传感器ID（如：GBCT6-H-R -> GBC6-H-R）
      if (id.startsWith('GBCT')) {
        // 提取数字和后面的部分
        const match = id.match(/^GBCT(\d+)(-.+)$/);
        if (match) {
          const num = match[1];
          const suffix = match[2];
          // 特殊情况：如果数字是两位数的，可能需要特殊处理
          return `GBC${num}${suffix}`;
        }
      }

      // 处理GBC开头的传感器ID，确保格式一致
      if (id.startsWith('GBC')) {
        const match = id.match(/^GBC(\d+)(-.+)$/);
        if (match) {
          const num = match[1];
          const suffix = match[2];
          return `GBC${num}${suffix}`;
        }
      }

      return id;
    },

    // 加载传感器数据
    async loadSensorData() {
      try {
        if(!this.sensorData.length) this.sensorData = await this.combineArr();
        // 创建数据查找映射 - 同时存储原始ID和标准化后的ID
        const dataMap = {};
        const normalizedMap = {};
        let duplicateCount = 0;

        this.sensorData.forEach(item => {
          if (item.安装位置) {
            // 存储原始ID映射
            if (dataMap[item.安装位置]) {
              duplicateCount++;
              console.warn(`重复的安装位置: ${item.安装位置}`);
            }
            dataMap[item.安装位置] = item;

            // 存储标准化ID映射（用于匹配页面上的ID）
            const normalizedId = this.normalizeSensorId(item.安装位置);
            if (normalizedId !== item.安装位置) {
              if (!normalizedMap[normalizedId]) {
                normalizedMap[normalizedId] = item;
              }
            }
          }
        });

        // 统计信息
        let stats = { normal: 0, warning: 0, danger: 0, critical: 0, unmatched: 0 };
        let unmatchedSensors = [];
        let matchedCount = 0;
        let matchedByNormalized = 0;

        // 获取所有传感器单元格
        const allSensors = document.querySelectorAll('.sensor-cell[data-id]');

        allSensors.forEach(cell => {
          const sensorId = cell.getAttribute('data-id');
          const sensorType = cell.getAttribute('data-type');

          // 先尝试直接匹配
          let data = dataMap[sensorId];
          let matchedBy = 'direct';

          // 如果直接匹配失败，尝试用标准化后的ID匹配
          if (!data) {
            // 对页面ID进行标准化（用于反向匹配）
            const normalizedPageId = this.normalizeSensorId(sensorId);
            if (normalizedPageId !== sensorId) {
              data = dataMap[normalizedPageId];
              if (data) matchedBy = 'normalized-reverse';
            }

            // 如果还不行，尝试在normalizedMap中查找
            if (!data) {
              data = normalizedMap[sensorId];
              if (data) matchedBy = 'normalized-forward';
            }
          }

          if (data) {
            matchedCount++;
            if (matchedBy !== 'direct') matchedByNormalized++;

            // 检查是否有有效业务数据
            const hasData = this.hasValidData(data);
            let statusInfo;

            if (!hasData) {
              // 只有安装位置，无业务数据 -> 设备异常
              statusInfo = this.statusMap['null'];
            } else {
              statusInfo = this.getStatusInfo(data.状态);
            }

            // 移除旧的状态类
            cell.classList.remove('status-normal', 'status-warning', 'status-danger', 'status-critical');
            // 添加新的状态类
            cell.classList.add(statusInfo.class);

            // 构建提示信息
            let tooltip = `${data.安装位置 || sensorId}: ${statusInfo.text}`;

            const strainFormatted = this.formatNumber(data.应变值, 2);
            if (strainFormatted !== null) tooltip += ` | 应变值: ${strainFormatted}`;

            const settleFormatted = this.formatNumber(data.沉降值, 2);
            if (settleFormatted !== null) tooltip += ` | 沉降值: ${settleFormatted}`;

            if (data["X向倾角(°)"] !== undefined && data["X向倾角(°)"] !== null)
              tooltip += ` | X向倾角: ${data["X向倾角(°)"]}°`;
            if (data["Y向倾角(°)"] !== undefined && data["Y向倾角(°)"] !== null)
              tooltip += ` | Y向倾角: ${data["Y向倾角(°)"]}°`;
            if (data.异常情况) tooltip += ` | ${data.异常情况}`;

            cell.setAttribute('data-tooltip', tooltip);

            // 统计（根据实际状态）
            if (!hasData) {
              stats.critical++;
            } else if (data.状态 === 0) {
              stats.normal++;
            } else if (data.状态 === 1) {
              stats.warning++;
            } else if (data.状态 === 2) {
              stats.danger++;
            } else {
              stats.critical++;
            }
          } else {
            // 未匹配到数据
            stats.unmatched++;
            unmatchedSensors.push({ id: sensorId, type: sensorType });
            cell.setAttribute('data-tooltip', `${sensorId}: 无数据`);
            // 未匹配的传感器保持默认样式（白色）
            cell.classList.remove('status-normal', 'status-warning', 'status-danger', 'status-critical');
          }
        });

        // 统计面板已移除
        console.log('传感器状态统计:', stats);
      } catch (error) {
        console.error('数据加载失败:', error.message);
      }
    }
  }
};
</script>

<style scoped>
.abnormal-date-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5vw;
  padding: 0.25vw;
  overflow-y: auto;
  background: rgba(0, 20, 40, 0.9);
  box-sizing: border-box;
}

.main-title {
  text-align: center;
  font-size: 1.2vw;
  font-weight: bold;
  margin-bottom: 0.5vwvw;
  color: #ffffff;
  text-shadow: 0 0 0.5vw rgba(0, 212, 255, 0.8);
}

.main-container {
  border: 0.15vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.4vw;
  padding: 0.8vw;
  background: rgba(0, 40, 80, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.7vw;
  box-shadow: 0 0.2vw 0.6vw rgba(0, 0, 0, 0.3), inset 0 0 1vw rgba(0, 140, 255, 0.1);
  overflow: visible;
}

/* 统一传感器小格样式 */
.sensor-cell {
  width: 1.5vw;
  height: 0.75vw;
  background: rgba(255, 255, 255, 0.767);
  border: 0.05vw solid #666;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

/* 标号基础样式 - 使用data-id属性 */
.sensor-cell::after {
  content: attr(data-id);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.5vw;
  font-weight: bold;
  color: white;
  display: none;
  pointer-events: none;
  white-space: nowrap;
  z-index: 100;
}

/* 提示框样式 - 悬停时显示，包含标号和信息 */
.sensor-cell:hover::before {
  /* attr(data-id) ': ' */
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.25vw 0.4vw;
  border-radius: 0.2vw;
  font-size: 0.55vw;
  white-space: nowrap;
  z-index: 9999;
  margin-bottom: 0.25vw;
  pointer-events: none;
  box-shadow: 0 0.1vw 0.4vw rgba(0, 0, 0, 0.5);
}

/* 库壁传感器容器 */
.letter-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5vw 1vw;
  border: 0.1vw solid rgba(0, 140, 255, 0.6);
  box-sizing: border-box;
  min-height: 12.5vw;
  background: rgba(0, 30, 60, 0.8);
  border-radius: 0.3vw;
  overflow: visible;
}

.letter-title {
  font-size: 0.9vw;
  font-weight: bold;
  margin-bottom: 0.5vw;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 0 0.25vw rgba(0, 212, 255, 0.5);
}

.letter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.4vw;
  position: relative;
  flex: 0 0 auto;
}

.letter {
  font-weight: bold;
  margin-bottom: 0.25vw;
  font-size: 0.8vw; 
  color: #ffffff;
}

/* 字母框网格布局 - 每列10个 */
.letter-box {
  display: grid;
  grid-template-rows: repeat(10, 1fr);
  gap: 0.1vw;
  padding: 0.4vw;
  border: 0.1vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.2vw;
  box-sizing: border-box;
  height: 10vw;
  grid-auto-flow: column;
  background: rgba(0, 20, 40, 0.8);
}

/* A区域: 10个 = 1列 */
.letter-box.cols-1 {
  grid-template-columns: repeat(1, 1fr);
  width: 2.5vw;
}

/* B区域: 32个 = 4列 */
.letter-box.cols-4 {
  grid-template-columns: repeat(4, 1fr);
  width: 7.4vw;
}

/* D区域: 26个 = 3列 */
.letter-box.cols-3 {
  grid-template-columns: repeat(3, 1fr);
  width: 5.7vw;
}

/* 底部传感器区域 */
.outer-frame {
  position: relative;
  border: 0.1vw solid rgba(0, 140, 255, 0.6);
  padding: 0.5vw 1vw 0.75vw;
  background: rgba(0, 30, 60, 0.8);
  margin-bottom: 0.75vw;
  box-sizing: border-box;
  border-radius: 0.3vw;
  overflow: visible;
}

.horizontal-sensors {
  display: flex;
  flex-direction: row;
  gap: 0.7vw;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
}

.horizontal-sensor-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.inclination-group {
  min-width: 12.5vw;
  flex: 1;
  min-width: 0;
}

.settlement-group {
  min-width: 12.5vw;
  flex: 1;
  min-width: 0;
}

.pile-group {
  min-width: 12.5vw;
  flex: 1;
  min-width: 0;
}

.horizontal-label {
  font-size: 0.8vw;
  font-weight: bold;
  margin-bottom: 0.4vw;
  white-space: nowrap;
  color: #ffffff;
  text-shadow: 0 0 0.25vw rgba(0, 212, 255, 0.5);
}

.bottom-box {
  height: 3vw;
  border: 0.1vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.2vw;
  box-sizing: border-box;
  width: 100%;
  background: rgba(0, 20, 40, 0.8);
  overflow: visible;
}

.bottom-grid-1xN {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.2vw;
  width: 100%;
  height: 100%;
  padding: 0.25vw 0.5vw;
  box-sizing: border-box;
  overflow: visible;
  flex-wrap: wrap;
}

/* 库底区域 */
.kudi-container {
  position: relative;
  border: 0.1vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.3vw;
  padding: 0.4vw 0.75vw;
  margin-top: 1vw;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 30, 60, 0.8);
  overflow: visible;
}

.kudi-title {
  font-size: 0.9vw;
  font-weight: bold;
  margin-bottom: 0.4vw;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 0 0.25vw rgba(0, 212, 255, 0.5);
}

.bottom-flex-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 0.1vw;
  width: 100%;
  height: 2.51vw;
  padding: 0 0.25vw;
  box-sizing: border-box;
}

/* 图例区域 */
.legend-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1vw;
  width: 100%;
  height: 2vw;
  margin-top: 0.75vw;
  padding: 0.4vw;
  box-sizing: border-box;
  background: rgba(0, 30, 60, 0.8);
  border: 0.1vw solid rgba(0, 140, 255, 0.6);
  border-radius: 0.3vw;
}

.legend-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4vw;
}

.legend-text {
  font-size: 0.7vw;
  color: #ffffff;
  white-space: nowrap;
  text-shadow: 0 0 0.25vw rgba(0, 212, 255, 0.5);
}

/* 状态颜色定义 */
.status-normal {
  background: rgba(255, 255, 255, 0.767);
}

.status-warning {
  background: #FFFF00;
}

.status-danger {
  background: #FFA500;
}

.status-critical {
  background: #FF0000;
}
</style>