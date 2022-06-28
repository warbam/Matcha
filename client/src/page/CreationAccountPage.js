import React, { useEffect, useState } from "react";
import "../styles/CreationAccountPage.css";
import { v4 as uuidv4 } from 'uuid';
import {
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    TextField,
    Button,
    Box,
    Step,
    Stepper,
    StepLabel,
    Grid,
    Container,
    Checkbox,
    Typography,
    FormGroup,
    Input,
    Slider,
    Modal
}
    from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from "react-hook-form";
import AvatarEditor from 'react-avatar-editor';
import Orientation from "./CreationAccountComp/Orientation";
import ImageChoose from "./CreationAccountComp/ImageChoose";
import TagChoice from "./CreationAccountComp/TagsChoice";
import Bio from "./CreationAccountComp/Bio";
import axios from "axios";
import FormData from 'form-data'

function CreationAccountPage() {

    const { handleSubmit } = useForm();
    const steps = ['Informations Personnel', 'Photos', 'Tags', 'Bio'];
    const [activeStep, setActiveStep] = useState(0);
    const [canNext, setCanNext] = useState(false);
    const [valueGender, setValueGender] = useState('');
    const [valueDate, setValueDate] = useState('');
    const [bio, setBio] = useState('');
    const [images, setImages] = useState('[]'); //JSON string
    const [tagsjson, setTagsjson] = useState('[]'); //JSON string
    const [files, setFiles] = useState([]);
    const [addFiles, setAddFiles] = useState(false)
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [me, setMe] = useState();

    var user = {
        gender: null,
        birthday_date: null,
        interessted: [],
    };
    const [state, setState] = useState({
        femme: false,
        homme: false,
        nonBinaire: false,
    });
    const { femme, homme, nonBinaire } = state;
    const error = [femme, homme, nonBinaire].filter((v) => v).length >= 1;

    const handleChangeInteressted = (name, checked) => {
        var cpy = state;
        cpy[name] = checked;
        setState(cpy);
    };


    useEffect(() => {
        localStorage.setItem('xsrf', window.location.search.split('=')[1])
    }, []);

    useEffect(() => {
        checkCanNext();
    }, [activeStep, valueDate, valueGender, state, images, tagsjson, bio]);

    const checkCanNext = () => {
        if (activeStep === 0) {
            if (valueGender != '' && valueDate != '' && error) {
                setCanNext(true);
            }
            else if (canNext) {
                setCanNext(false);
            }
        }
        if (activeStep === 1) {
            var cpy = JSON.parse(images);
            var a = 0;
            if (cpy[0] != null && (cpy[1] != null || cpy[2] != null || cpy[3] != null || cpy[4] != null || cpy[5] != null)) {
                setCanNext(true);
            }
            else if (canNext) {
                setCanNext(false);
            }
        }
        if (activeStep === 2) {
            var cpy = JSON.parse(tagsjson);
            var a = 0;
            if (cpy.length > 2 && cpy.length < 8) {
                setCanNext(true);
            }
            else if (canNext) {
                setCanNext(false);
            }
        }
        if (activeStep === 3) {
            if (bio.length > 4 && bio.length < 100) {
                setCanNext(true);
            }
            else if (canNext) {
                setCanNext(false);
            }
        }
    }

    const getMe = () => {
        const headers = new Headers();
        headers.append('x-xsrf-token', localStorage.getItem('xsrf'));
        const options = {
            method: 'GET',
            mode: 'cors',
            headers,
            credentials: 'include'
        };
        fetch('http://' + window.location.href.split('/')[2].split(':')[0] + ':667/users/me', options)
            .then(function (response) {
                setMe(response.body);
            })
    }

    const handleChangeDate = (value) => {
        setValueDate(value);
    };

    const handleChangeGender = (value) => {
        setValueGender(value);
    };

    const urltoFile = async (url, filename, mimeType) => {
        mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
        return (await fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) {
                return new File([buf], filename, { type: mimeType });
            })
        );
    }

    const handleNext = async () => {
        if (activeStep === 3) {
            navigator.geolocation.getCurrentPosition(function (position) {
                console.log("Latitude is :", position.coords.latitude);
                console.log("Longitude is :", position.coords.longitude);
            });
            var files = []
            const headers = new Headers();
            headers.append('x-xsrf-token', localStorage.getItem('xsrf'));
            console.log(window.location.search.split('=')[1]);
            console.log(localStorage.getItem('xsrf'));
            // headers.append('Content-Type', 'multipart/form-data; boundary=------WebKitFormBoundaryuNV21uHBQKetGs6R');
            const form = new FormData();
            var cpy = JSON.parse(images)
            console.log(cpy.length);
            for ( var i = 0; i < cpy.length ; i++) {
                if (cpy[i] !== null)
                    files.push(await urltoFile(cpy[i]))
                if (i == cpy.length - 1) {
                    console.log(files);
                    if (files[0]) {
                        form.append('imgs0', files[0]);
                    }
                    if (files[1]) {
                        form.append('imgs1', files[1]);
                    }
                    if (files[2]) {
                        form.append('imgs2', files[2]);
                    }
                    if (files[3]) {
                        form.append('imgs3', files[3]);
                    }
                    if (files[4]) {
                        form.append('imgs4', files[4]);
                    }
                    if (files[5]) {
                        form.append('imgs5', files[5]);
                    }
                    form.append('genre', valueGender)
                    form.append('homme', state.homme)
                    form.append('femme', state.femme)
                    form.append('nonBinaire', state.nonBinaire)
                    form.append('tags', tagsjson)
                    form.append('bio', bio)
                    const options = {
                        method: 'POST',
                        mode: 'cors',
                        headers,
                        body: form,
                        credentials: 'include'
                    };
                    fetch('http://' + window.location.href.split('/')[2].split(':')[0] + ':667/users/completeProfile', options)
                        .then(function (response) {
                            console.log(response)
                            if (response.ok) {
                                // window.location = 'http://' + window.location.href.split('/')[2].split(':')[0] + ':3000/home'
                            }
                            else {
                                // window.location = 'http://' + window.location.href.split('/')[2].split(':')[0] + ':3000/'
                            }
                        })
                }
            }
            // for ( var i = 0; i < files.length; i++ ) {
            //     form.append('files', files[i]);
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        // setCanNext(false);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        // setCanNext(false);
    };

    const handleChangeImage = (value) => {
        setImages(JSON.stringify(value));
    };

    const updateProfil = () => {
        if (activeStep === 0) {
            user.gender = valueGender;
            user.birthday_date = valueDate;
            user.interessted[0] = state.femme;
            user.interessted[1] = state.homme;
            user.interessted[2] = state.nonBinaire;
            if (valueGender === 'femme') {
                user.gender = 0;
            }
            if (valueGender === 'homme') {
                user.gender = 1;
            }
            if (valueGender === 'nonBinaire') {
                user.gender = 2;
            }
        }
    }

    return (
        <Container maxWidth={false} sx={{ marginTop: '10em' }}>
            <Grid container columns={12} spacing={3} >
                {activeStep === 0 &&
                    <Orientation interesstedChange={handleChangeInteressted} genderChange={handleChangeGender} dateChange={handleChangeDate} gender={valueGender} h={state.homme} f={state.femme} n={state.nonBinaire} date={valueDate} />}
                {activeStep === 1 &&
                    <ImageChoose onChange={handleChangeImage} images={JSON.parse(images)} />}
                {activeStep === 2 &&
                    <TagChoice onChange={setTagsjson} />
                }
                {activeStep === 3 &&
                    <Bio onChange={setBio} defaultValue={bio} />
                }
                <Grid className={'ButtonDiv'}>
                    {activeStep !== 0 &&
                        <Grid item xs={12} sm={12} md={12} className={'ButtonBackDiv'}>
                            <Button
                                className={"ButtonBack"}
                                variant="contained"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                sx={{ mr: 1 }}
                            >
                                Retour
                            </Button>
                        </Grid>
                    }
                    <Grid item xs={12} sm={12} md={12} className={'ButtonNextDiv'}>
                        {/* {canNext ?
                            <Button onClick={() => { handleNext(), updateProfil() }} className={"ButtonNextEnable"} >
                                {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                            </Button>
                            :
                            <Button disabled onClick={() => { handleNext(), updateProfil() }} className={"ButtonNextDisable"} >
                                {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                            </Button>
                        } */}
                        <Button onClick={() => { handleNext(), updateProfil() }} className={"ButtonNextEnable"} >
                            {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                        </Button>
                        <Button onClick={() => { getMe() }} className={"ButtonNextEnable"} >
                            {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
                        </Button>
                    </Grid>
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                    <Box className={'Stepper'}>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label, index) => {
                                const stepProps = {};
                                const labelProps = {};
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                    </Box>
                </Grid>
            </Grid>
        </Container>

    );
}

export default CreationAccountPage;

// WEBPACK FOOTER //
// src/Loginform/LoginForm.js
