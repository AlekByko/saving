import React from 'react';
import ReactDOM from 'react-dom';

export class Keyboard extends React.Component {
    render() {
        return (
            <div className="keyboard-wrapper">

                <div className="keyboard">
                    <div className="row">
                        <div className="key">Esc</div>
                        <div className="gap in-body-delim" style={{flex: 1.0}}></div>
                        <div className="key">F1</div>
                        <div className="key">F2</div>
                        <div className="key">F3</div>
                        <div className="key">F4</div>
                        <div className="gap in-body-delim" style={{flex: 0.5}}></div>
                        <div className="key">F5</div>
                        <div className="key">F6</div>
                        <div className="key">F7</div>
                        <div className="key">F8</div>
                        <div className="gap" style={{flex: 0.5}}></div>
                        <div className="key">F9</div>
                        <div className="key">F10</div>
                        <div className="key">F11</div>
                        <div className="key">F12</div>
                    </div>

                    <div className="row">
                        <div className="key">`<br /><small>~</small></div>
                        <div className="key">1<br /><small>!</small></div>
                        <div className="key">2<br /><small>@</small></div>
                        <div className="key">3<br /><small>#</small></div>
                        <div className="key">4<br /><small>$</small></div>
                        <div className="key">5<br /><small>%</small></div>
                        <div className="key">6<br /><small>^</small></div>
                        <div className="key">7<br /><small>&</small></div>
                        <div className="key">8<br /><small>*</small></div>
                        <div className="key">9<br /><small>(</small></div>
                        <div className="key">0<br /><small>)</small></div>
                        <div className="key">-<br /><small>_</small></div>
                        <div className="key">=<br /><small>+</small></div>
                        <div className="key in-body-delim" style={{ flex: 2 }}>Backspace</div>
                    </div>

                    <div className="row">
                        <div className="key" style={{ flex: 1.3 }}>Tab</div>
                        <div className="key">Q</div>
                        <div className="key">W</div>
                        <div className="key">E</div>
                        <div className="key">R</div>
                        <div className="key">T</div>
                        <div className="key">Y</div>
                        <div className="key">U</div>
                        <div className="key">I</div>
                        <div className="key">O</div>
                        <div className="key">P</div>
                        <div className="key">[<br /><small>[</small></div>
                        <div className="key">]<br /><small>]</small></div>
                        <div className="key" style={{ flex: 1.3 }}><br /><small>|</small></div>
                    </div>

                    <div className="row">
                        <div className="key" style={{ flex: 1.5 }}>Caps</div>
                        <div className="key">A</div>
                        <div className="key">S</div>
                        <div className="key">D</div>
                        <div className="key">F</div>
                        <div className="key">G</div>
                        <div className="key">H</div>
                        <div className="key">J</div>
                        <div className="key">K</div>
                        <div className="key">L</div>
                        <div className="key">;<br /><small>:</small></div>
                        <div className="key">'<br /><small>"</small></div>
                        <div className="key" style={{ flex: 1.8 }}>Enter</div>
                    </div>

                    <div className="row">
                        <div className="key" style={{ flex: 2 }}>Shift</div>
                        <div className="key">Z</div>
                        <div className="key">X</div>
                        <div className="key">C</div>
                        <div className="key">V</div>
                        <div className="key">B</div>
                        <div className="key">N</div>
                        <div className="key">M</div>
                        <div className="key">,<br /><small>&lt;</small></div>
                        <div className="key">.<br /><small>&gt;</small></div>
                        <div className="key">/<br /><small>?</small></div>
                        <div className="key" style={{ flex: 2 }}>Shift</div>
                    </div>

                    <div className="row">
                        <div className="key">Ctrl</div>
                        <div className="key">Win</div>
                        <div className="key">Alt</div>
                        <div className="key" style={{ flex: 6 }}>Space</div>
                        <div className="key">Alt</div>
                        <div className="key">Fn</div>
                        <div className="key">Menu</div>
                        <div className="key">Ctrl</div>
                    </div>
                </div>

                <div className="side-stack">
                    <div className="nav-block">
                        <div className="row">
                            <div className="key">PrtSc</div>
                            <div className="key">ScrLk</div>
                            <div className="key">Pause</div>
                        </div>
                        <div className="row">
                            <div className="key">Ins</div>
                            <div className="key">Home</div>
                            <div className="key">PgUp</div>
                        </div>
                        <div className="row">
                            <div className="key">Del</div>
                            <div className="key">End</div>
                            <div className="key">PgDn</div>
                        </div>
                    </div>
                    <div className="cursor-block-wrapper">
                        <div className="cursor-block">
                            <div className="row">
                                <div className="key placeholder"></div>
                                <div className="key">↑</div>
                                <div className="key placeholder"></div>
                            </div>
                            <div className="row">
                                <div className="key">←</div>
                                <div className="key">↓</div>
                                <div className="key">→</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="numpad-block">
                    <div className="key">Num</div>
                    <div className="key">/</div>
                    <div className="key">*</div>
                    <div className="key">-</div>

                    <div className="key">7</div>
                    <div className="key">8</div>
                    <div className="key">9</div>
                    <div className="key plus">+</div>

                    <div className="key">4</div>
                    <div className="key">5</div>
                    <div className="key">6</div>

                    <div className="key">1</div>
                    <div className="key">2</div>
                    <div className="key">3</div>
                    <div className="key enter">Enter</div>

                    <div className="key zero">0</div>
                    <div className="key">.</div>
                </div>

            </div>
        );
    }
}

if (window.sandbox === 'keyboard') {
    const rootElement = document.getElementById('root')!;
    ReactDOM.render(<Keyboard />, rootElement);
}

