import { useState, useEffect, createContext } from "react";
import * as React from "react";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { Icon } from "@iconify/react";
import { NumericFormat } from "react-number-format";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Alert,
  ButtonGroup,
  Collapse,
  Container,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import CustomizedProgressBars from "./CustomizedProgressBars";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
import TokenArtifact from "./contracts/StknICO.json";

import contractAddress from "./contracts/contract-address.json";
import timeInterval from "./contracts/time-interval.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const stknICO = new ethers.Contract(
  contractAddress.StknICO,
  TokenArtifact.abi,
  provider.getSigner(0)
);

async function getVariables() {
  const ra = await stknICO.raisedAmount();
  const hc = await stknICO.hardCap();
  console.log(ra, hc);
}

getVariables();

const DepositContext = createContext();

function FlowingClock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Typography
      variant="h5"
      style={{ display: "flex", justifyContent: "center" }}
    >
      {time}
    </Typography>
  );
}

const NumericFormatCustom = React.forwardRef(function NumericFormatCustom(
  props,
  ref
) {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      valueIsNumericString
      suffix="  BNB"
    />
  );
});

NumericFormatCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const buttons = (handleChange, values, depositAction) => [
  // <TextField inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} size='small' />,
  <TextField
    label="Deposite Amount"
    value={values.depositInput}
    onChange={handleChange}
    name="numberformat"
    id="formatted-numberformat-input"
    InputProps={{
      inputComponent: NumericFormatCustom,
    }}
    variant="standard"
    style={{
      width: "600%",
      marginRight: 20,
    }}
  />,
  <Button
    variant="contained"
    color="success"
    onClick={depositAction}
    disabled={!values.connected}
  >
    Deposit
  </Button>,
];

const timeField = (startTime, endTime, flag) => {
  const currentTime = dayjs(new Date());
  const disabled =
    currentTime < endTime || (flag && stknICO.raisedAmount() < 1e25);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: 0,
        }}
      >
        <DateTimeField defaultValue={startTime} size="small" disabled />
        <ButtonGroup>
          <IconButton
            variant="contained"
            disabled={disabled}
            color="success"
            onClick={() => stknICO.claim()}
          >
            <Icon icon="fluent-emoji-high-contrast:baggage-claim" />
          </IconButton>
          <IconButton
            variant="contained"
            disabled={disabled}
            color="error"
            onClick={() => stknICO.withdraw()}
          >
            <Icon icon="uil:money-withdraw" />
          </IconButton>
        </ButtonGroup>
        <DateTimeField defaultValue={endTime} size="small" disabled />
      </Container>
    </LocalizationProvider>
  );
};

export default function RecipeReviewCard() {
  const startTime = dayjs(timeInterval.from * 1000);
  const endTime = dayjs(timeInterval.to * 1000);

  const [values, setValues] = React.useState({
    depositInput: 0,
    connected: false,
    error: false,
  });
  const [address, setAddress] = useState("");

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const withdraw = async () => {
    try {
      await stknICO.withdraw();
    } catch (error) {
      setOpen("User withdraw failed");
    }
  };

  const claim = async () => {
    try {
      await stknICO.claim();
    } catch (error) {
      setOpen("User claim failed");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.enable(); // Request access to wallet
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const accounts = await signer.getAddress(); // Get wallet address
        setAddress(accounts); // Set user's wallet address to state

        setValues({
          ...values,
          connected: true,
        });
      } catch (error) {
        setOpen("Connection failed");
      }
    } else {
      setOpen("Metamask not detected.");
    }
  };

  const progress = values.connected
    ? (100 * stknICO.raisedAmount()) / stknICO.hardCap()
    : 0;

  const deposit = async (value) => {
    try {
      await stknICO.deposit({ value });
    } catch (error) {
      setOpen("User rejected transaction");
    }
  };

  const depositAction = () => {
    deposit(values.depositInput);
  };

  const setOpen = (isOpen) => {
    setValues({
      ...values,
      error: isOpen,
    });
  };

  return (
    <DepositContext.Provider value={values}>
      <Collapse in={values.error}>
        <Alert
          color="error"
          fullWidth
          style={{
            position: "absolute",
            top: 20,
            right: 20,
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {values.error}
        </Alert>
      </Collapse>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Card sx={{ maxWidth: 800, minWidth: 600 }}>
          <CardHeader
            avatar={FlowingClock()}
            action={
              <Button variant="contained" onClick={connectWallet}>
                Connect Wallet
              </Button>
            }
            title="ICO DApp Board"
            subheader="Created by mighty 2-8"
          />
          <CardContent>
            <ButtonGroup fullWidth>
              {buttons(handleChange, values, depositAction)}
            </ButtonGroup>
            <CustomizedProgressBars value={progress} />
            {timeField(startTime, endTime, values.connected)}
          </CardContent>
        </Card>
      </Box>
    </DepositContext.Provider>
  );
}
