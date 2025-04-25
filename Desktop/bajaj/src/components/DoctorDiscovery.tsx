import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Avatar,
  SelectChangeEvent,
  Chip,
  Rating,
  Button,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  VideoCall as VideoCallIcon,
  LocalHospital as HospitalIcon,
  Star as StarIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import doctorsData from '../data/doctors.json';

interface Specialty {
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  name_initials: string;
  photo: string;
  doctor_introduction: string;
  specialities: Specialty[];
  fees: string;
  experience: string;
  languages: string[];
  clinic: {
    name: string;
    address: {
      locality: string;
      city: string;
      address_line1: string;
      location: string;
      logo_url: string;
    };
  };
  video_consult: boolean;
  in_clinic: boolean;
}

interface DoctorSuggestion {
  id: string;
  name: string;
  specialities: Specialty[];
  photo: string;
}

const DoctorDiscovery: React.FC = () => {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // State from URL params
  const [nameFilter, setNameFilter] = useState(searchParams.get('name') || '');
  const [consultationType, setConsultationType] = useState<'video' | 'clinic' | ''>(
    (searchParams.get('consultationType') as 'video' | 'clinic') || ''
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    searchParams.get('specialties')?.split(',') || []
  );
  const [sortBy, setSortBy] = useState<'fees' | 'experience' | ''>(
    (searchParams.get('sortBy') as 'fees' | 'experience') || ''
  );

  // Load doctors data
  useEffect(() => {
    try {
      setDoctors(doctorsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load doctors data');
      setLoading(false);
    }
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (nameFilter) params.set('name', nameFilter);
    if (consultationType) params.set('consultationType', consultationType);
    if (selectedSpecialties.length) params.set('specialties', selectedSpecialties.join(','));
    if (sortBy) params.set('sortBy', sortBy);
    setSearchParams(params);
  }, [nameFilter, consultationType, selectedSpecialties, sortBy, setSearchParams]);

  // Get unique specialties
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>();
    doctors.forEach(doctor => {
      doctor.specialities.forEach(specialty => uniqueSpecialties.add(specialty.name));
    });
    return Array.from(uniqueSpecialties);
  }, [doctors]);

  // Filter and sort doctors
  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    // Apply name filter
    if (nameFilter) {
      result = result.filter(doctor =>
        doctor.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply consultation type filter
    if (consultationType === 'video') {
      result = result.filter(doctor => doctor.video_consult);
    } else if (consultationType === 'clinic') {
      result = result.filter(doctor => doctor.in_clinic);
    }

    // Apply specialties filter
    if (selectedSpecialties.length > 0) {
      result = result.filter(doctor =>
        doctor.specialities.some(specialty => selectedSpecialties.includes(specialty.name))
      );
    }

    // Apply sorting
    if (sortBy === 'fees') {
      result.sort((a, b) => parseInt(a.fees) - parseInt(b.fees));
    } else if (sortBy === 'experience') {
      result.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    }

    return result;
  }, [doctors, nameFilter, consultationType, selectedSpecialties, sortBy]);

  // Get autocomplete suggestions with more details
  const suggestions = useMemo(() => {
    if (!nameFilter) return [];
    return doctors
      .filter(doctor =>
        doctor.name.toLowerCase().includes(nameFilter.toLowerCase()) ||
        doctor.specialities.some(specialty => 
          specialty.name.toLowerCase().includes(nameFilter.toLowerCase())
        )
      )
      .map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialities: doctor.specialities,
        photo: doctor.photo
      }))
      .slice(0, 5);
  }, [doctors, nameFilter]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <SearchIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
      </motion.div>
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Typography color="error" variant="h5">{error}</Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          My Doc
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Find the best doctors near you
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Search and Filters */}
        <Grid item xs={12} md={3}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper 
              sx={{ 
                p: 2,
                position: 'sticky',
                top: 20,
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                background: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(10px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SearchIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Autocomplete
                  data-testid="autocomplete-input"
                  freeSolo
                  options={suggestions}
                  value={nameFilter}
                  onChange={(event: React.SyntheticEvent, newValue: string | DoctorSuggestion | null) => {
                    if (typeof newValue === 'string') {
                      setNameFilter(newValue);
                    } else if (newValue) {
                      setNameFilter(newValue.name);
                    } else {
                      setNameFilter('');
                    }
                  }}
                  onInputChange={(event: React.SyntheticEvent, newInputValue: string) => setNameFilter(newInputValue)}
                  getOptionLabel={(option: string | DoctorSuggestion) => typeof option === 'string' ? option : option.name}
                  renderOption={(props, option: string | DoctorSuggestion) => (
                    <li {...props} data-testid="suggestion-item">
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar
                          src={typeof option === 'string' ? '' : option.photo}
                          alt={typeof option === 'string' ? option : option.name}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          {typeof option === 'string' ? option.charAt(0) : option.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {typeof option === 'string' ? option : option.name}
                          </Typography>
                          {typeof option !== 'string' && (
                            <Typography variant="body2" color="textSecondary">
                              {option.specialities.map(s => s.name).join(', ')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Doctors"
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="No doctors found"
                  loadingText="Searching..."
                  sx={{
                    '& .MuiAutocomplete-option': {
                      py: 1.5,
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <FilterIcon sx={{ mr: 1 }} />
                  Filters
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" data-testid="filter-header-moc">Consultation Type</FormLabel>
                  <RadioGroup
                    value={consultationType}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                      setConsultationType(event.target.value as 'video' | 'clinic')
                    }
                  >
                    <FormControlLabel 
                      value="video" 
                      control={<Radio data-testid="filter-video-consult" />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VideoCallIcon sx={{ mr: 1 }} />
                          Video Consult
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="clinic" 
                      control={<Radio data-testid="filter-in-clinic" />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <HospitalIcon sx={{ mr: 1 }} />
                          In Clinic
                        </Box>
                      } 
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom data-testid="filter-header-speciality">Specialties</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {specialties.map((specialty) => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      onClick={() => {
                        if (selectedSpecialties.includes(specialty)) {
                          setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
                        } else {
                          setSelectedSpecialties([...selectedSpecialties, specialty]);
                        }
                      }}
                      color={selectedSpecialties.includes(specialty) ? 'primary' : 'default'}
                      variant={selectedSpecialties.includes(specialty) ? 'filled' : 'outlined'}
                      data-testid={`filter-specialty-${specialty.replace(/\s+/g, '-')}`}
                    />
                  ))}
                </Box>
              </Box>

              <FormControl fullWidth>
                <InputLabel data-testid="filter-header-sort">Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(event: SelectChangeEvent) => 
                    setSortBy(event.target.value as 'fees' | 'experience')
                  }
                  label="Sort By"
                  size="small"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="fees" data-testid="sort-fees">Fees (Low to High)</MenuItem>
                  <MenuItem value="experience" data-testid="sort-experience">Experience (High to Low)</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </motion.div>
        </Grid>

        {/* Doctor List */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {filteredDoctors.map((doctor, index) => (
              <Grid item xs={12} sm={6} key={doctor.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    data-testid="doctor-card"
                    sx={{ 
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[8],
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          src={doctor.photo}
                          alt={doctor.name}
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mr: 2,
                            border: `2px solid ${theme.palette.primary.main}`,
                          }}
                        >
                          {doctor.name_initials}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom data-testid="doctor-name">
                            {doctor.name}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {doctor.specialities.map(specialty => (
                              <Chip
                                key={specialty.name}
                                label={specialty.name}
                                size="small"
                                color="primary"
                                variant="outlined"
                                data-testid="doctor-specialty"
                              />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={5} readOnly size="small" />
                            <Typography variant="body2" color="textSecondary">
                              (4.9)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Typography variant="body2" paragraph sx={{ 
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {doctor.doctor_introduction}
                      </Typography>

                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: 1,
                        mb: 2 
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" data-testid="doctor-fee">
                            ₹{doctor.fees}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" data-testid="doctor-experience">
                            {doctor.experience} years
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {doctor.languages.join(', ')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" noWrap>
                            {doctor.clinic.address.locality}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.divider}`
                      }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {doctor.video_consult && (
                            <Tooltip title="Video Consult Available">
                              <Chip
                                icon={<VideoCallIcon />}
                                label="Video"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Tooltip>
                          )}
                          {doctor.in_clinic && (
                            <Tooltip title="In-Clinic Available">
                              <Chip
                                icon={<HospitalIcon />}
                                label="Clinic"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Tooltip>
                          )}
                        </Box>
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                        >
                          Book Appointment
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorDiscovery; 